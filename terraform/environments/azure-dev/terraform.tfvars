resource_group_name = "james"
location            = "East US"

vnet_name   = "aks-vnet"
subnet_name = "aks-subnet"

address_space   = ["10.0.0.0/20"]
subnet_prefixes = ["10.0.1.0/24"]

cluster_name = "my-aks-cluster"
dns_prefix   = "myaksdns"

node_count = 1
vm_size    = "Standard_B2ms"

tags = {
  Environment = "Dev"
}

# terraform output -raw kube_config > kubeconfig
# export KUBECONFIG=./kubeconfig