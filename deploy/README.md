# Google Cloud Run — ZORI Earth Observatory

The frontend is a static site served by nginx on port 8080. This deploy does **not** provide a NISAR processing backend.

## Deploy
From the repository root, after installing and authenticating the Google Cloud CLI:

```sh
gcloud config set project YOUR_GOOGLE_CLOUD_PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
gcloud run deploy zori-observatory --source . --region europe-west6 --allow-unauthenticated
```

The service URL is printed after deployment. Cloud Run may ask to create an Artifact Registry repository.

## Scientific backend
`frontend/config.js` contains a placeholder. Do not put private backend API keys or secrets in public JavaScript. Use Cloud Run environment variables or Secret Manager on a separate backend, and expose only safe public configuration to the browser.

## Disclaimer
Independent educational project using public satellite-data services. Not an official NASA or ISRO website. Live data availability and processing must be validated before presentation.
