<?php

// Nombre del archivo JSON donde se almacenan las tareas
$file = 'tasks.json';

// Si el archivo no existe, créalo con una estructura inicial vacía
if (!file_exists($file)) {
    file_put_contents($file, json_encode(['tasks' => []]));
}

// Configura el encabezado de respuesta para JSON
header('Content-Type: application/json');

// Maneja las acciones según el parámetro 'action' en la URL
switch ($_GET['action']) {
    // Obtener todas las tareas
    case 'get':
        echo file_get_contents($file);
        break;

    // Agregar una nueva tarea
    case 'add':
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $tasks = json_decode(file_get_contents($file), true);
            $data = json_decode(file_get_contents('php://input'), true);
            $task = [
                'id' => uniqid(),
                'text' => $data['task'],
                'completed' => false
            ];
            $tasks['tasks'][] = $task;
            file_put_contents($file, json_encode($tasks));
            echo json_encode($task);
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
        }
        break;

    // Eliminar una tarea
    case 'delete':
        if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
            $tasks = json_decode(file_get_contents($file), true);
            $tasks['tasks'] = array_filter($tasks['tasks'], function($task) {
                return $task['id'] !== $_GET['id'];
            });
            file_put_contents($file, json_encode($tasks));
            echo json_encode(['status' => 'success']);
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
        }
        break;

    // Actualizar el estado de una tarea
    case 'update':
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $tasks = json_decode(file_get_contents($file), true);
            $data = json_decode(file_get_contents('php://input'), true);
            foreach ($tasks['tasks'] as &$task) {
                if ($task['id'] === $data['id']) {
                    $task['completed'] = $data['completed'];
                }
            }
            file_put_contents($file, json_encode($tasks));
            echo json_encode(['status' => 'success']);
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
        }
        break;

    // Acción no reconocida
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Bad Request']);
        break;
}
?>
