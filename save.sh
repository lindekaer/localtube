echo "Fetching files..."

node /Users/theo/code/localtube/index.js

echo "Uploading files to bucket..."

gsutil -m cp -r -n /Users/theo/code/localtube/songs gs://personal-theo-backup

echo "Done!"