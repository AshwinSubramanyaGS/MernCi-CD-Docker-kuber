pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'localhost:5000'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build with Docker') {
            steps {
                script {
                    // This requires Docker Pipeline plugin
                    docker.build("${DOCKER_REGISTRY}/task-manager-backend:latest", "./backend")
                    docker.build("${DOCKER_REGISTRY}/task-manager-frontend:latest", "./frontend")
                }
            }
        }
        
        stage('Deploy') {
            steps {
                sh 'echo "Deploying to Kubernetes..."'
            }
        }
    }
}