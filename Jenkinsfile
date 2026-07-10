
pipeline {
    agent any

    environment {
        DOCKER_IMAGE      = "yourdockerhubusername/expense-tracker"
        DOCKER_TAG        = "${env.BUILD_NUMBER}"
        DOCKERHUB_CREDS   = credentials('dockerhub-credentials-id')
        KUBECONFIG_CREDS  = credentials('kubeconfig-credentials-id')
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Harishbarani/Java-Containerized-App-Deployment'
            }
        }

        stage('Build & Unit Test') {
            steps {
                sh 'mvn clean package'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $DOCKER_IMAGE:$DOCKER_TAG .'
            }
        }

        stage('Push to Docker Hub') {
            steps {
                sh '''
                    echo "$DOCKERHUB_CREDS_PSW" | docker login -u "$DOCKERHUB_CREDS_USR" --password-stdin
                    docker push $DOCKER_IMAGE:$DOCKER_TAG
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                    export KUBECONFIG=$KUBECONFIG_CREDS
                    kubectl set image deployment/expense-tracker-deployment expense-tracker-container=$DOCKER_IMAGE:$DOCKER_TAG --record
                    kubectl rollout status deployment/expense-tracker-deployment
                '''
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully — expense tracker deployed to Kubernetes.'
        }
        failure {
            echo 'Pipeline failed. Check the stage logs above for details.'
        }
    }
}