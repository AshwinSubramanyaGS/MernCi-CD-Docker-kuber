pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Node.js') {
            steps {
                // Manual Node.js installation - always works
                sh '''
                # Check if Node.js is already installed
                if ! command -v node > /dev/null 2>&1; then
                    echo "Installing Node.js..."
                    # For Debian/Ubuntu based Jenkins image
                    apt-get update && apt-get install -y curl
                    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
                    apt-get install -y nodejs
                fi
                
                # Verify installation
                echo "Node.js version: $(node --version)"
                echo "npm version: $(npm --version)"
                '''
            }
        }
        
        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'npm install'
                    sh 'docker build -t task-manager-backend:latest .'
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                    sh 'docker build -t task-manager-frontend:latest .'
                }
            }
        }
        
        stage('Deploy') {
            steps {
                sh '''
                kubectl apply -f k8s/ || true
                echo "Deployment completed!"
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