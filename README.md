Expense Tracker — Containerized Deployment with Docker, Jenkins \& Kubernetes





Note: This repo is named Java-Containerized-App-Deployment, describing the DevOps/deployment layer of the project. The application itself is an Expense Tracker (Java Spring Boot).







About this project



Expense Tracker is a Java Spring Boot application for tracking transactions and peer lending, with a JavaScript/HTML/CSS frontend served directly by Spring Boot. This repo contains the application source code along with its containerization and CI/CD deployment setup — a Dockerfile, Jenkins pipeline, and Kubernetes manifests.



The Docker, Jenkins, and Kubernetes configuration was built and self-taught as part of a mentor-assigned sprint task during a DevOps training internship, then recreated and documented independently in this repository.



What this covers





Containerizing the Spring Boot app (backend + static frontend) using a multi-stage Dockerfile

Automating build, image push, and deployment through a Jenkins pipeline

Deploying and exposing the application on Kubernetes using Deployment and Service manifests





Tech Stack





Backend: Java, Spring Boot

Frontend: JavaScript, HTML, CSS (served as static resources)

Database: H2 (file/in-memory)

Build Tool: Maven

Containerization: Docker

CI/CD: Jenkins

Orchestration: Kubernetes





Project Structure



.

├── Dockerfile

├── Jenkinsfile

├── k8s/

│   ├── deployment.yaml

│   └── service.yaml

├── src/

│   └── main/

│       ├── java/com/tracker/expense\_tracker/

│       │   ├── controller/

│       │   ├── model/

│       │   ├── repository/

│       │   ├── service/

│       │   └── ExpenseTrackerApplication.java

│       └── resources/

│           ├── static/        # app.js, index.html, styles.css, images

│           ├── templates/

│           └── application.properties

├── pom.xml

└── README.md



How the pipeline works





Jenkins checks out the source code on every push to main.

Maven builds the application and runs unit tests.

A Docker image is built and pushed to Docker Hub.

Jenkins updates the Kubernetes Deployment with the new image tag.

Kubernetes performs a rolling update and reports rollout status.





Running locally



bash# Build the jar

mvn clean package



\# Build and run the Docker image

docker build -t expense-tracker .

docker run -p 8080:8080 expense-tracker



Visit http://localhost:8080 to view the app.



Deploying to Kubernetes



bashkubectl apply -f k8s/deployment.yaml

kubectl apply -f k8s/service.yaml



Notes \& Known Limitations





Single replica by design. H2 runs in-memory/file mode local to each pod, so data isn't shared across replicas. The Deployment is intentionally set to replicas: 1. Scaling horizontally would require migrating to an external database (MySQL/PostgreSQL) with a shared connection.

Data persistence: if using H2 in file mode, mount a persistent volume in the Deployment to avoid losing data on pod restarts; if using in-memory mode, data resets on every restart by design.

Docker Hub and kubeconfig credentials in the Jenkinsfile are referenced as Jenkins credential IDs and should be configured in your own Jenkins instance — no secrets are hardcoded.



