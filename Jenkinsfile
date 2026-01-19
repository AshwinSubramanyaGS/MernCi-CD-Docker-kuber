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
                    // Example: Trivy scan for vulnerabilities
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
                    // For local registry
                    docker.withRegistry("http://${DOCKER_REGISTRY}") {
                        docker.image(BACKEND_IMAGE).push()
                        docker.image(FRONTEND_IMAGE).push()
                    }
                    
                    // For Docker Hub (uncomment if using)
                    /*
                    docker.withRegistry('https://index.docker.io/v1/', DOCKERHUB_CREDENTIALS) {
                        docker.image(BACKEND_IMAGE).push()
                        docker.image(FRONTEND_IMAGE).push()
                    }
                    */
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            when {
                branch 'main'  // Only deploy from main branch
            }
            steps {
                script {
                    // Update Kubernetes manifests with new image tags
                    sh """
                    sed -i 's|image: task-manager-backend:.*|image: ${BACKEND_IMAGE}|g' k8s/backend-deployment.yaml
                    sed -i 's|image: task-manager-frontend:.*|image: ${FRONTEND_IMAGE}|g' k8s/frontend-deployment.yaml
                    """
                    
                    // Apply Kubernetes manifests
                    withKubeConfig([credentialsId: 'kube-config', serverUrl: '', contextName: 'docker-desktop']) {
                        sh """
                        kubectl apply -f k8s/namespace.yaml
                        kubectl apply -f k8s/ -n ${K8S_NAMESPACE}
                        """
                    }
                }
            }
        }
        
        stage('Rolling Update') {
            when {
                branch 'main'
            }
            steps {
                script {
                    withKubeConfig([credentialsId: 'kube-config', serverUrl: '', contextName: 'docker-desktop']) {
                        // Trigger rolling update
                        sh """
                        kubectl rollout restart deployment/backend -n ${K8S_NAMESPACE}
                        kubectl rollout restart deployment/frontend -n ${K8S_NAMESPACE}
                        
                        # Wait for rollout to complete
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
                    sh '''
                    # Test backend health
                    kubectl get pods -n task-manager
                    
     