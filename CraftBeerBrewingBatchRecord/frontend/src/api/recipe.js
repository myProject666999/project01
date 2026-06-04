import request from '@/utils/request'

export function getRecipeList(params) {
  return request({
    url: '/recipes/page',
    method: 'get',
    params
  })
}

export function getAllRecipes() {
  return request({
    url: '/recipes',
    method: 'get'
  })
}

export function getRecipeDetail(id) {
  return request({
    url: `/recipes/${id}`,
    method: 'get'
  })
}

export function getRecipeByCode(recipeCode) {
  return request({
    url: `/recipes/code/${recipeCode}`,
    method: 'get'
  })
}

export function getRecipeHistory(recipeCode) {
  return request({
    url: `/recipes/history/${recipeCode}`,
    method: 'get'
  })
}

export function getLatestVersion(recipeCode) {
  return request({
    url: `/recipes/latest/${recipeCode}`,
    method: 'get'
  })
}

export function addRecipe(data) {
  return request({
    url: '/recipes',
    method: 'post',
    data
  })
}

export function createNewVersion(data) {
  return request({
    url: '/recipes/new-version',
    method: 'post',
    data
  })
}

export function updateRecipe(data) {
  return request({
    url: '/recipes',
    method: 'put',
    data
  })
}

export function deleteRecipe(id) {
  return request({
    url: `/recipes/${id}`,
    method: 'delete'
  })
}
