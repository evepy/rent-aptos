export const ABI = {"address":"0xcb8b57d6f98f4295fc261eddca12af69988e5a2a02e0359e5f2ab71e57277de4","name":"advanced_todo_list","friends":[],"exposed_functions":[{"name":"complete_todo","visibility":"public","is_entry":true,"is_view":false,"generic_type_params":"","params":"\u0026signer u64 u64","return":""},{"name":"create_todo","visibility":"public","is_entry":true,"is_view":false,"generic_type_params":"","params":"\u0026signer u64 0x1::string::String","return":""},{"name":"create_todo_list","visibility":"public","is_entry":true,"is_view":false,"generic_type_params":"","params":"\u0026signer","return":""},{"name":"get_todo","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":"","params":"address u64 u64","return":"0x1::string::String bool"},{"name":"get_todo_list","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":"","params":"address u64","return":"address u64"},{"name":"get_todo_list_by_todo_list_obj_addr","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":"","params":"address","return":"address u64"},{"name":"get_todo_list_counter","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":"","params":"address","return":"u64"},{"name":"get_todo_list_obj_addr","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":"","params":"address u64","return":"address"},{"name":"has_todo_list","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":"","params":"address u64","return":"bool"}],"structs":[{"name":"Todo","is_native":false,"abilities":"copy drop store","generic_type_params":"","fields":" "},{"name":"TodoList","is_native":false,"abilities":"key","generic_type_params":"","fields":" "},{"name":"UserTodoListCounter","is_native":false,"abilities":"key","generic_type_params":"","fields":""}]} as const
