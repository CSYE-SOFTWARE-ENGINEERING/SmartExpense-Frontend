source "amazon-ebs" "frontend" {
  ami_name      = "smartexpense-fe-{{timestamp}}"
  instance_type = "t2.micro"
  region        = "us-east-1"
  source_ami_filter {
    filters = {
      name                = "ubuntu/images/*ubuntu-20.04-amd64-server-*"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true
    owners      = ["099720109477"]
  }
  ssh_username = "ubuntu"
}

build {
  sources = ["source.amazon-ebs.frontend"]

  provisioner "file" {
    source      = "../dist"
    destination = "/home/ubuntu/frontend"
  }

  provisioner "shell" {
    inline = [
      "sudo apt update",
      "sudo apt install -y nginx",
      "sudo cp -r /home/ubuntu/frontend/* /var/www/html/",
      "sudo systemctl restart nginx"
    ]
  }
}
