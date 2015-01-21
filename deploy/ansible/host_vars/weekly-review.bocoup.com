---
env: production
hostname: weekly-review
app_base_path: /mnt/weekly-review/
app_fqdn: weekly-review.bocoup.com
npm_run_script: start
ansible_ssh_user: ubuntu
ansible_ssh_private_key_file: "{{ lookup('env', 'PWD') }}/config/secrets/bocoup-app.pem"
