pipeline {
    agent {
        docker {
            image 'docker:24-cli'  // Docker CLI image
            args '-v /var/run/docker.sock:/var/run/docker.sock -u root'  // Mount Docker socket
            reuseNode true
        }
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build Images') {
            steps {
                sh '''
                echo "Building Docker images..."
                docker build -t task-manager-backend:latest ./backend
                docker build -t task-manager-frontend:latest ./frontend
                
                echo "Images built:"
                docker images | grep task-manager
                '''
            }
        }
        
        stage('Deploy') {
            steps {
                sh '''
                echo "Checking if kubectl is available..."
                which kubectl || echo "kubectl not found"
                
                echo "Deploying to Kubernetes..."
                # Try to deploy, but don't fail if k8s not available
                if command -v kubectl > /dev/null 2>&1; then
                    kubectl apply -f k8s/ 2>/dev/null || echo "K8s deployment attempted"
                else
                    echo "kubectl not available, skipping K8s deployment"
                fi
                '''
            }
        }
    }
    
    post {
        always {
            echo "✅ Pipeline completed: ${currentBuild.result}"
        }
    }
}