terraform {
  required_version = ">= 1.5.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

provider "azurerm" {
  features {}
}

module "resource_group" {
  source = "../../modules/azure/resource-group"

  name     = var.resource_group_name
  location = var.location
  tags     = var.tags
}

module "networking" {
  source = "../../modules/azure/networking"

  vnet_name          = var.vnet_name
  subnet_name        = var.subnet_name
  location           = module.resource_group.location
  resource_group_name = module.resource_group.name

  address_space   = var.address_space
  subnet_prefixes = var.subnet_prefixes
  tags            = var.tags
}

module "aks" {
  source = "../../modules/azure/aks"

  cluster_name       = var.cluster_name
  location           = module.resource_group.location
  resource_group_name = module.resource_group.name
  dns_prefix         = var.dns_prefix
  subnet_id          = module.networking.subnet_id

  node_count = var.node_count
  vm_size    = var.vm_size

  tags = var.tags
}

output "kube_config" {
  value     = module.aks.kube_config
  sensitive = true
}