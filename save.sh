echo "Fetching files..."

node index.js

echo "Uploading files to bucket..."

gsutil -m cp -r -n songs gs://personal-theo-backup

echo "Done!"