pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo '✅ Code checked out from GitHub'
            }
        }
        
        stage('Build Docker Images') {
            steps {
                sh '''
                echo "🔨 Building Docker images..."
                
                # Build backend image
                cd backend
                docker build -t task-manager-backend:latest .
                
                # Build frontend image
                cd ../frontend
                docker build -t task-manager-frontend:latest .
                
                echo "✅ Images built successfully:"
                docker images | grep task-manager
                '''
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                echo "🚀 Deploying to Kubernetes..."
                
                # Create namespace if not exists
                kubectl create namespace task-manager --dry-run=client -o yaml | kubectl apply -f -
                
                # Apply MongoDB
                kubectl apply -f k8s/mongodb.yaml -n task-manager
                
                # Apply backend
                kubectl apply -f k8s/backend-deployment.yaml -n task-manager
                kubectl apply -f k8s/backend-service.yaml -n task-manager
                
                # Apply frontend
                kubectl apply -f k8s/frontend.yaml -n task-manager
                
                echo "✅ Deployment initiated"
                '''
            }
        }
        
        stage('Verify Deployment') {
            steps {
                sh '''
                echo "📊 Checking deployment status..."
                
                # Wait for pods to start
                sleep 30
                
                echo "=== Pods Status ==="
                kubectl get pods -n task-manager
                
                echo "=== Services ==="
                kubectl get svc -n task-manager
                
                echo "=== Checking backend health ==="
                # Try to port-forward and test
                kubectl port-forward svc/backend 5000:5000 -n task-manager --address=0.0.0.0 &
                sleep 5
                
                if curl -f http://localhost:5000/api/v1/health 2>/dev/null; then
                    echo "✅ Backend is healthy!"
                else
                    echo "❌ Backend not responding"
                    echo "Checking logs..."
                    kubectl logs -n task-manager deployment/backend --tail=20
                fi
                
                # Kill port-forward
                pkill -f "kubectl port-forward"
                '''
            }
        }
        
        stage('Access Application') {
            steps {
                sh '''
                echo "🌐 Application URLs:"
                echo ""
                echo "To access frontend:"
                echo "kubectl port-forward svc/frontend 3000:80 -n task-manager"
                echo "Then open: http://localhost:3000"
                echo ""
                echo "To access backend API:"
                echo "kubectl port-forward svc/backend 5000:5000 -n task-manager"
                echo "API: http://localhost:5000/api/v1/health"
                '''
            }
        }
    }
    
    post {
        always {
            echo "🏁 Pipeline completed: ${currentBuild.result}"
            
            sh '''
            echo "=== Final Status ==="
            kubectl get all -n task-manager 2>/dev/null || echo "Namespace not found"
            '''
        }
        
        success {
            echo '🎉 CI/CD Pipeline Successful!'
            echo 'Application should be running in Kubernetes'
        }
        
        failure {
            echo '⚠️ Pipeline completed with errors'
        }
    }
}