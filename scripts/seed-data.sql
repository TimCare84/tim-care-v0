-- Insert sample patients
INSERT INTO patients (name, phone, email, avatar_initials, status, contact_reason, description, needs_intervention) VALUES
('Ana García Martínez', '+34 612 345 678', 'ana.garcia@email.com', 'AG', 'proceso', 'Reagendar cita médica', 'La paciente necesita cambiar su cita programada para la próxima semana debido a un compromiso laboral imprevisto. Prefiere horarios de tarde.', true),
('Carlos López Ruiz', '+34 687 654 321', 'carlos.lopez@email.com', 'CL', 'agendado', 'Consulta sobre cita', 'Paciente consulta sobre el horario de su cita programada para mañana. Cita confirmada para las 11:00 AM con el Dr. Martínez.', false),
('María Rodríguez', '+34 655 987 654', 'maria.rodriguez@email.com', 'MR', 'estancado', 'Dolor de cabeza persistente', 'Paciente reporta dolor de cabeza desde hace 3 días. Requiere evaluación médica urgente.', true),
('José Martínez', '+34 644 123 789', 'jose.martinez@email.com', 'JM', 'pagado', 'Consulta de seguimiento', 'Paciente satisfecho con el tratamiento. Consulta de seguimiento programada.', false),
('Laura Sánchez', '+34 633 456 012', 'laura.sanchez@email.com', 'LS', 'proceso', 'Cambio de cita', 'Solicita cambio de horario para su cita programada.', true);

-- Insert conversations
INSERT INTO conversations (patient_id, status, last_message, needs_intervention) 
SELECT 
  p.id,
  CASE WHEN p.needs_intervention THEN 'inbox' ELSE 'ai' END,
  CASE 
    WHEN p.name = 'Ana García Martínez' THEN 'Necesito reagendar mi cita para la próxima semana'
    WHEN p.name = 'Carlos López Ruiz' THEN '¿A qué hora es mi cita de mañana?'
    WHEN p.name = 'María Rodríguez' THEN 'Tengo dolor de cabeza desde ayer'
    WHEN p.name = 'José Martínez' THEN 'Gracias por la información sobre los medicamentos'
    WHEN p.name = 'Laura Sánchez' THEN '¿Puedo cambiar mi cita?'
  END,
  p.needs_intervention
FROM patients p;

-- Insert sample messages
WITH conversation_data AS (
  SELECT c.id as conv_id, p.name 
  FROM conversations c 
  JOIN patients p ON c.patient_id = p.id
)
INSERT INTO messages (conversation_id, content, sender, timestamp) 
SELECT 
  cd.conv_id,
  CASE 
    WHEN cd.name = 'Ana García Martínez' THEN 'Hola, necesito reagendar mi cita para la próxima semana por favor'
    WHEN cd.name = 'Carlos López Ruiz' THEN '¿A qué hora es mi cita de mañana?'
    WHEN cd.name = 'María Rodríguez' THEN 'Tengo dolor de cabeza desde ayer'
    WHEN cd.name = 'José Martínez' THEN 'Gracias por la información sobre los medicamentos'
    WHEN cd.name = 'Laura Sánchez' THEN '¿Puedo cambiar mi cita?'
  END,
  'patient',
  NOW() - INTERVAL '1 hour'
FROM conversation_data cd;

-- Insert sample appointments
INSERT INTO appointments (patient_id, date, time, doctor, status) 
SELECT 
  p.id,
  CURRENT_DATE + INTERVAL '1 day',
  '11:00:00',
  'Dr. Martínez',
  'scheduled'
FROM patients p 
WHERE p.name IN ('Carlos López Ruiz', 'Ana García Martínez');

INSERT INTO appointments (patient_id, date, time, doctor, status) 
SELECT 
  p.id,
  CURRENT_DATE + INTERVAL '3 days',
  '14:00:00',
  'Dr. González',
  'scheduled'
FROM patients p 
WHERE p.name = 'Laura Sánchez';
