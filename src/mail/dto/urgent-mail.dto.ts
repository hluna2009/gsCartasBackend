export class UrgentMailDto {
  email: string;
  nombre: string;
  cc: string[];
  priority: string;

  asunto: string;
  fechaIngreso: string;
  resumenRecibido: string;
  urgente: boolean;
  estado: string;
  pdfInfo: string;
  archivosAdjuntos: string[];
}
