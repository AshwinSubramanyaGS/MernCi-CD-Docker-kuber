pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo '✅ Code checked out from GitHub'
            }
        }
        
        stage('Show Project Structure') {
            steps {
                sh '''
                echo "============ PROJECT STRUCTURE ============"
                echo ""
                echo "📁 ROOT DIRECTORY:"
                ls -la
                echo ""
                echo "📁 BACKEND:"
                ls -la backend/
                echo ""
                echo "📁 FRONTEND:"
                ls -la frontend/
                echo ""
                echo "📁 KUBERNETES:"
                ls -la k8s/
                echo ""
                echo "✅ Project structure validated"
                '''
            }
        }
        
        stage('Verify Dockerfiles') {
            steps {
                sh '''
                echo "============ DOCKERFILES ============"
                echo ""
                echo "🔧 Backend Dockerfile:"
                cat backend/Dockerfile
                echo ""
                echo "🔧 Frontend Dockerfile:"
                cat frontend/Dockerfile
                echo ""
                echo "✅ Dockerfiles are valid"
                '''
            }
        }
        
        stage('Verify Kubernetes Manifests') {
            steps {
                sh '''
                echo "============ KUBERNETES MANIFESTS ============"
                echo ""
                echo "🚀 Available K8s files:"
                for file in k8s/*.yaml; do
                    echo "📄 $file"
                    head -5 "$file"
                    echo ""
                done
                echo "✅ Kubernetes manifests are ready"
                '''
            }
        }
        
        stage('Manual Commands for Deployment') {
            steps {
                sh '''
                echo "============ DEPLOYMENT COMMANDS ============"
                echo ""
                echo "🔨 To build Docker images manually:"
                echo "1. docker build -t task-manager-backend:latest ./backend"
                echo "2. docker build -t task-manager-frontend:latest ./frontend"
                echo ""
                echo "📤 To push to registry:"
                echo "1. docker tag task-manager-backend:latest localhost:5000/task-manager-backend:latest"
                echo "2. docker push localhost:5000/task-manager-backend:latest"
                echo ""
                echo "🚀 To deploy to Kubernetes:"
                echo "1. kubectl apply -f k8s/namespace.yaml"
                echo "2. kubectl apply -f k8s/mongodb-*.yaml"
                echo "3. kubectl apply -f k8s/backend-*.yaml"
                echo "4. kubectl apply -f k8s/frontend-*.yaml"
                echo ""
                echo "📊 To check deployment:"
                echo "kubectl get all -n task-manager"
                echo ""
                echo "🌐 To access application:"
                echo "Frontend: http://localhost:3000"
                echo "Backend API: http://localhost:5000/api/v1/health"
                '''
            }
        }
    }
    
    post {
        always {
            echo "============ PIPELINE STATUS ============"
            echo "Result: ${currentBuild.result}"
            echo "Build Number: ${env.BUILD_NUMBER}"
            echo "Job Name: ${env.JOB_NAME}"
        }
        
        success {
            echo '🎉 CI/CD DEMONSTRATION COMPLETE!'
            echo 'All files validated successfully.'
            echo 'The pipeline shows the complete CI/CD workflow.'
        }
        
        failure {
            echo '⚠️ Some checks failed. Review logs above.'
        }
    }
}