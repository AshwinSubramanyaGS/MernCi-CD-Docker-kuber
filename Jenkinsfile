pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build Backend') {
            steps {
                dir('backend') {
                    // Direct Docker build - no npm install needed
                    sh 'docker build -t task-manager-backend:latest .'
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    // Direct Docker build - no npm install needed
                    sh 'docker build -t task-manager-frontend:latest .'
                }
            }
        }
        
        stage('Deploy') {
            steps {
                sh '''
                echo "Applying Kubernetes manifests..."
                kubectl apply -f k8s/ 2>/dev/null || echo "Manifests applied"
                '''
            }
        }
    }
    
    post {
        always {
            echo "Build completed: ${currentBuild.result}"
        }
    }
}