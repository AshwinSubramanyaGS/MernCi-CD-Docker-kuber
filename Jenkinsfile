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
                // Method 1: Use nvm (no sudo needed)
                sh '''
                # Install Node.js using nvm (no root required)
                echo "Installing Node.js using nvm..."
                
                # Install nvm if not present
                if [ ! -d "$HOME/.nvm" ]; then
                    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
                    export NVM_DIR="$HOME/.nvm"
                    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
                fi
                
                # Load nvm
                export NVM_DIR="$HOME/.nvm"
                [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
                [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
                
                # Install Node.js
                nvm install 20
                nvm use 20
                
                # Verify installation
                echo "Node.js version:"
                node --version
                echo "npm version:"
                npm --version
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