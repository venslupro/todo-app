# Durable Objects configuration for WebSocket support.

# Durable Object binding for the Worker script.
resource "cloudflare_worker_durable_object_binding" "todo_websocket_binding" {
  account_id = var.account_id
  script_name = cloudflare_worker_script.todo_api.name
  
  name        = "TODO_WEBSOCKET"
  class_name  = "TodoWebSocket"
  namespace_id = cloudflare_durable_object_namespace.todo_websocket.id
  
  depends_on = [
    cloudflare_worker_script.todo_api,
    cloudflare_durable_object_namespace.todo_websocket
  ]
}