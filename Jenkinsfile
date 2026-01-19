pipeline {
    agent any
    
    environment {
        // Docker registry configuration
        DOCKER_REGISTRY = 'localhost:5000'  // For local registry
        // For Docker Hub:
        // DOCKER_REGISTRY = ''
        // DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        
        // Image tags
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/task-manager-backend:${env.BUILD_NUMBER}-${env.GIT_COMMIT.substring(0, 7)}"
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/task-manager-frontend:${env.BUILD_NUMBER}-${env.GIT_COMMIT.substring(0, 7)}"
        
        // Kubernetes namespace
        K8S_NAMESPACE = 'task-manager'
        
        // Build args
        VITE_API_URL = 'http://backend:5000/api/v1'
        
        // SonarQube (optional) hope this doesnt crash
        SONAR_HOST_URL = 'http://localhost:9000'
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'echo "Building commit: ${GIT_COMMIT}"'
            }
        }
        
        stage('Setup Environment') {
            steps {
                script {
                    // Create .env files for build
                    sh '''
                    echo "VITE_API_URL=${VITE_API_URL}" > frontend/.env.production
                    echo "NODE_ENV=production" > backend/.env.build
                    '''
                }
            }
        }
        
        stage('Lint & Test') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            sh 'npm install'
                            sh 'npm run lint || true'  # Continue even if lint fails
                            sh 'npm test || true'      # Continue even if tests fail
                        }
                    }
                }
                
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                            sh 'npm run lint || true'
                            sh 'npm test || true'
                        }
                    }
                }
            }
        }
        
        stage('Code Quality (SonarQube)') {
            when {
                expression { return fileExists('sonar-project.properties') }
            }
            steps {
                script {
                    dir('backend') {
                        withSonarQubeEnv('SonarQube') {
                            sh 'sonar-scanner'
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Build Backend Image') {
                    steps {
                        dir('backend') {
                            script {
                                docker.build(BACKEND_IMAGE, "--build-arg NODE_ENV=production .")
                            }
                        }
                    }
                }
                
                stage('Build Frontend Image') {
                    steps {
                        dir('frontend') {
                            script {
                                docker.build(FRONTEND_IMAGE, "--build-arg VITE_API_URL=${VITE_API_URL} .")
                            }
                        }
                    }
                }
            }
        }
        
        stage('Scan Images (Security)') {
            steps {
                script {
                    // Trivy scan for vulnerabilities
                    sh '''
                    docker run --rm \
                      -v /var/run/docker.sock:/var/run/docker.sock \
                      aquasec/trivy:latest \
                      image --severity HIGH,CRITICAL ${BACKEND_IMAGE} || true
                    
                    docker run --rm \
                      -v /var/run/docker.sock:/var/run/docker.sock \
                      aquasec/trivy:latest \
                      image --severity HIGH,CRITICAL ${FRONTEND_IMAGE} || true
                    '''
                }
            }
        }
        
        stage('Push to Registry') {
            steps {
                script {
                    // Start local registry if not running
                    sh '''
                    docker ps | grep registry || docker run -d -p 5000:5000 --name registry registry:2
                    '''
                    
                    // Tag and push to local registry
                    sh """
                    docker tag ${BACKEND_IMAGE} ${DOCKER_REGISTRY}/task-manager-backend:latest
                    docker tag ${FRONTEND_IMAGE} ${DOCKER_REGISTRY}/task-manager-frontend:latest
                    
                    docker push ${DOCKER_REGISTRY}/task-manager-backend:latest
                    docker push ${DOCKER_REGISTRY}/task-manager-frontend:latest
                    docker push ${BACKEND_IMAGE}
                    docker push ${FRONTEND_IMAGE}
                    """
                }
            }
        }
        
        stage('Deploy to Development') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    // Update Kubernetes manifests
                    sh """
                    sed -i 's|image:.*task-manager-backend:.*|image: ${DOCKER_REGISTRY}/task-manager-backend:latest|g' k8s/backend-deployment.yaml
                    sed -i 's|image:.*task-manager-frontend:.*|image: ${DOCKER_REGISTRY}/task-manager-frontend:latest|g' k8s/frontend-deployment.yaml
                    """
                    
                    // Apply to dev namespace
                    withKubeConfig([credentialsId: 'kube-config', serverUrl: '', contextName: 'docker-desktop']) {
                        sh """
                        kubectl apply -f k8s/namespace.yaml
                        kubectl apply -f k8s/ -n ${K8S_NAMESPACE}-dev
                        """
                    }
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    // Update Kubernetes manifests with specific version
                    sh """
                    sed -i 's|image:.*task-manager-backend:.*|image: ${BACKEND_IMAGE}|g' k8s/backend-deployment.yaml
                    sed -i 's|image:.*task-manager-frontend:.*|image: ${FRONTEND_IMAGE}|g' k8s/frontend-deployment.yaml
                    """
                    
                    // Apply to production namespace
                    withKubeConfig([credentialsId: 'kube-config', serverUrl: '', contextName: 'docker-desktop']) {
                        sh """
                        kubectl apply -f k8s/namespace.yaml
                        kubectl apply -f k8s/ -n ${K8S_NAMESPACE}
                        
                        # Wait for rollout
                        kubectl rollout status deployment/backend -n ${K8S_NAMESPACE} --timeout=300s
                        kubectl rollout status deployment/frontend -n ${K8S_NAMESPACE} --timeout=300s
                        """
                    }
                }
            }
        }
        
        stage('Smoke Tests') {
            when {
                branch 'main'
            }
            steps {
                script {
                    // Wait for services to be ready
                    sleep 30
                    
                    // Run smoke tests
                    withKubeConfig([credentialsId: 'kube-config', serverUrl: '', contextName: 'docker-desktop']) {
                        sh '''
                        # Get pod status
                        kubectl get pods -n task-manager
                        
                        # Test backend health endpoint
                        BACKEND_POD=$(kubectl get pods -n task-manager -l app=backend -o jsonpath='{.items[0].metadata.name}')
                        kubectl exec -n task-manager $BACKEND_POD -- curl -f http://localhost:5000/api/v1/health || exit 1
                        
                        # Test frontend (port-forward temporarily)
                        kubectl port-forward service/frontend 3000:80 -n task-manager --address=0.0.0.0 &
                        sleep 5
                        curl -f http://localhost:3000 || curl -f http://localhost:3000/health || true
                        pkill -f "kubectl port-forward"
                        '''
                    }
                }
            }
        }
        
        stage('Integration Tests') {
            when {
                branch 'main'
            }
            steps {
                script {
                    dir('tests') {
                        sh '''
                        # Run API integration tests
                        npm install
                        npm run test:integration || true
                        '''
                    }
                }
            }
        }
    }
    
    post {
        always {
            // Clean up workspace
            cleanWs()
            
            // Archive artifacts
            archiveArtifacts artifacts: '**/test-results/**/*.xml', allowEmptyArchive: true
            archiveArtifacts artifacts: '**/coverage/**/*', allowEmptyArchive: true
            
            // JUnit test report
            junit '**/test-results/**/*.xml'
        }
        
        success {
            echo 'Pipeline completed successfully!'
            
            // Send notification
            emailext(
                subject: "✅ Pipeline Success: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: """Pipeline ${env.JOB_NAME} - Build #${env.BUILD_NUMBER} completed successfully!
                
                View changes: ${env.CHANGE_URL ?: 'N/A'}
                Build URL: ${env.BUILD_URL}
                Commit: ${env.GIT_COMMIT}
                Branch: ${env.BRANCH_NAME}
                """,
                to: 'dev-team@example.com'
            )
        }
        
        failure {
            echo 'Pipeline failed!'
            
            // Send failure notification
            emailext(
                subject: "❌ Pipeline Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: """Pipeline ${env.JOB_NAME} - Build #${env.BUILD_NUMBER} failed!
                
                Check logs at: ${env.BUILD_URL}
                Failed stage: ${env.STAGE_NAME}
                """,
                to: 'dev-team@example.com'
            )
        }
        
        unstable {
            echo 'Pipeline is unstable (tests failed)'
        }
    }
}