# ZORI Observatory — Google Cloud Run deployment

The repository serves the browser frontend and the real NASA ASF catalog/processing API together through FastAPI (Python), not nginx.

## What you need

- A Google Cloud project with billing enabled and permission to deploy Cloud Run.
- A free NASA Earthdata Login account at https://urs.earthdata.nasa.gov/ and its API token for protected NISAR HDF5 science-data downloads.
- No local software: run these commands in https://shell.cloud.google.com/ after choosing your Cloud project.

NEVER paste NASA tokens into ChatGPT, GitHub, public JavaScript or screenshots.

## 1. Start in Cloud Shell

~~~bash
git clone https://github.com/marymair/NISAR.git
cd NISAR
export PROJECT_ID="PASTE_YOUR_GCP_PROJECT_ID_HERE"
export REGION="europe-west6"
gcloud config set project "$PROJECT_ID"
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com
~~~

## 2. Store the Earthdata token securely

Create an Earthdata Login user token from your NASA Earthdata profile. Google Secret Manager stores the token; the Cloud Run runtime reads it as an environment variable. Create these once; if already present, skip the create command.

~~~bash
gcloud iam service-accounts create zori-run --display-name="ZORI observatory runtime"
gcloud secrets create zori-earthdata-token --replication-policy=automatic

read -rs -p "NASA Earthdata token (hidden): " NASA_TOKEN
printf '\n'
printf '%s' "$NASA_TOKEN" | gcloud secrets versions add zori-earthdata-token --data-file=-
unset NASA_TOKEN

gcloud secrets add-iam-policy-binding zori-earthdata-token \
  --member="serviceAccount:zori-run@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
~~~

## 3. Deploy to Cloud Run

The first build may ask to create an Artifact Registry repository. This implementation keeps jobs in memory, so keep one instance and CPU allocated during the evaluation. WARNING: a minimum instance and always-on CPU cost money continuously. Set a Google Cloud budget alert before enabling them, and stop the instance after the competition.

~~~bash
gcloud run deploy zori-observatory \
  --source . \
  --region "$REGION" \
  --allow-unauthenticated \
  --service-account="zori-run@$PROJECT_ID.iam.gserviceaccount.com" \
  --set-secrets="EARTHDATA_TOKEN=zori-earthdata-token:latest" \
  --max-instances=1 \
  --min-instances=1 \
  --no-cpu-throttling \
  --cpu=2 \
  --memory=4Gi \
  --concurrency=8 \
  --timeout=900
~~~

Copy the HTTPS URL that Google prints. To publish the interface and public ASF catalog without a token, omit --set-secrets (but full processing will then return HTTP 503 EARTHDATA_LOGIN_REQUIRED).

## 4. Verify the URL

~~~bash
curl -fsS "YOUR_ACTUAL_CLOUD_RUN_URL/health"

curl -G "YOUR_ACTUAL_CLOUD_RUN_URL/api/search" \
  --data-urlencode "lat=10.55" \
  --data-urlencode "lon=-66.9" \
  --data-urlencode "start=2026-06-17" \
  --data-urlencode "end=2026-07-05" \
  --data-urlencode "change=ground"
~~~

Open the actual URL. Health should report earthdata_credentials_configured=true when the token is present. Try a location with matching GCOV dates and launch processing. If it fails, inspect Cloud Run logs. A healthy website is NOT proof that authenticated HDF5 range reads and science algorithms have worked end-to-end.

## Scientific honesty and costs

- ASF NISAR products typically appear 36–72 hours after acquisition. This is live archive search and analysis on demand, NOT live satellite telemetry.
- GCOV differences are radar backscatter variations, not certified flood/fire areas. GUNW phase fringes are not fully corrected land-surface displacement.
- VALIDATED, PROVISIONAL and BETA products use distinct NASA Earthdata collections; don't mix them in paired quantitative comparisons.
- Jobs live in process memory and are lost on container restart. This is a demonstrator, not production disaster-response infrastructure.
- Big HDF5 datasets can be slow; Cloud Run RAM and egress charges may apply.
- After demo, delete the service or scale minimum instances to zero to save money. With min-instances=0, ongoing background jobs may be stopped.

## Sources

- https://nisar-docs.asf.alaska.edu/
- https://docs.asf.alaska.edu/
- https://urs.earthdata.nasa.gov/
- https://cloud.google.com/run/docs/deploying-source-code
- https://cloud.google.com/secret-manager/docs/creating-and-accessing-secrets
