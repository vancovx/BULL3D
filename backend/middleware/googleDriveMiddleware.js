const { google } = require('googleapis');
const multer = require('multer');
const streamifier = require('streamifier');
const path = require('path');
const fs = require('fs-extra');

// Configuración de almacenamiento en memoria para multer
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 1 * 1024 * 1024 * 1024 } 
});

// Configuración de autenticación con Google Drive API
class GoogleDriveService {
  constructor() {
    this.drive = null;
    this.auth = null; // Store the auth client
    this.initialize();
  }

  initialize() {
    try {
      // Cargar credenciales desde el archivo JSON
      const credentialsPath = path.join(__dirname, '../config/google-drive-credentials.json');
      const credentialsFile = fs.readFileSync(credentialsPath);
      const credentials = JSON.parse(credentialsFile).web;  // Cambiado para acceder a la propiedad .web
  
      const client = new google.auth.OAuth2(
        credentials.client_id,
        credentials.client_secret,
        credentials.redirect_uris[0]  // Usar el primer URI de redirección
      );
  
      // Asegurarse de que el refresh token existe en el archivo de credenciales
      if (!credentials.refresh_token) {
        throw new Error('Falta el refresh token en el archivo de credenciales. Ejecuta getRefreshToken.js primero.');
      }
  
      client.setCredentials({ refresh_token: credentials.refresh_token });
      this.auth = client; // Store the auth client
      
      this.drive = google.drive({ version: 'v3', auth: client });
      console.log('Google Drive API inicializada correctamente');
    } catch (error) {
      console.error('Error al inicializar Google Drive API:', error);
      throw error; 
    }
  }

  // Get a fresh access token
  async getAccessToken() {
    try {
      const { token } = await this.auth.getAccessToken();
      return token;
    } catch (error) {
      console.error('Error al obtener access token:', error);
      throw error;
    }
  }

  // Get file metadata
 // Get file metadata
async getFileMetadata(fileId) {
  try {
    const response = await this.drive.files.get({
      fileId,
      fields: 'id,name,mimeType,size,webContentLink,webViewLink'
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error al obtener metadatos del archivo ${fileId}:`, error);
    throw error;
  }
}

  // Generate a direct download URL for a file
  async getDownloadUrl(fileId) {
    try {
      // Verificar que el archivo existe y obtener sus metadatos
      const fileMetadata = await this.getFileMetadata(fileId);
      
      // Crear una URL de descarga directa que no use el proxy
      const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
      
      return {
        downloadUrl,
        fileName: fileMetadata.name,
        mimeType: fileMetadata.mimeType,
        size: fileMetadata.size
      };
    } catch (error) {
      console.error('Error al generar URL de descarga:', error);
      throw error;
    }
  }

  // Subir un archivo a Google Drive y obtener la URL pública
  async uploadFile(fileBuffer, mimeType, fileName, folderId = null) {
    try {
      const fileMetadata = {
        name: fileName,
        parents: folderId ? [folderId] : []
      };

      const media = {
        mimeType,
        body: streamifier.createReadStream(fileBuffer)
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id,webViewLink'
      });

      // Configurar permisos para hacer el archivo accesible públicamente
      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
          allowFileDiscovery: false
        },
        sendNotificationEmail: false
      });

      // En lugar de devolver una URL directa de Google Drive, 
      // devolvemos una URL que apunta a nuestro propio proxy
      const fileId = response.data.id;
      const directUrl = `/api/proxy/image/${fileId}`;
      
      return {
        id: response.data.id,
        viewUrl: response.data.webViewLink,
        directUrl
      };
    } catch (error) {
      console.error('Error al subir archivo a Google Drive:', error);
      throw error;
    }
  }

  // Crear una carpeta en Google Drive
  async createFolder(folderName, parentFolderId = null) {
    try {
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : []
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        fields: 'id,webViewLink'
      });

      // Configurar permisos para hacer la carpeta accesible públicamente
      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
          allowFileDiscovery: false
        }
      });

      return {
        id: response.data.id,
        viewUrl: response.data.webViewLink
      };
    } catch (error) {
      console.error('Error al crear carpeta en Google Drive:', error);
      throw error;
    }
  }

  // Eliminar un archivo o carpeta de Google Drive
  async deleteFile(fileId) {
    if (!fileId) {
      console.log('Se intentó eliminar un archivo con ID indefinido o nulo');
      return false;
    }

    try {
      console.log(`Intentando eliminar archivo con ID: ${fileId}`);
      
      // Verificar primero si el archivo existe
      const checkFile = await this.drive.files.get({
        fileId: fileId,
        fields: 'id,name,mimeType'
      }).catch(err => {
        // Si el archivo no existe o hay otro error al obtenerlo
        console.log(`Error al verificar existencia del archivo ${fileId}:`, err.message);
        return null;
      });
      
      // Si el archivo no existe, devolvemos verdadero ya que el resultado es el mismo
      if (!checkFile) {
        console.log(`El archivo ${fileId} no existe o no es accesible`);
        return true;
      }
      
      console.log(`Archivo encontrado: ${checkFile.data.name} (${checkFile.data.mimeType})`);
      
      // Eliminar el archivo
      await this.drive.files.delete({
        fileId: fileId
      });
      
      console.log(`Archivo ${fileId} eliminado con éxito`);
      return true;
    } catch (error) {
      console.error(`Error detallado al eliminar archivo ${fileId}:`, error);
      
      // Si el error es 404 (archivo no encontrado), consideramos que ya está eliminado
      if (error.response && error.response.status === 404) {
        console.log(`Archivo ${fileId} no encontrado, se considera ya eliminado`);
        return true;
      }
      
      // Comprobar si hay errores de permisos o token expirado
      if (error.response && error.response.status === 401) {
        console.error('Error de autenticación. Posible token expirado.');
      } else if (error.response && error.response.status === 403) {
        console.error('Error de permisos. No tienes permiso para eliminar este archivo.');
      }
      
      // Para cualquier otro error, lo propagamos
      throw error;
    }
  }

  // Actualizar un archivo existente
  async updateFile(fileId, fileBuffer, mimeType) {
    try {
      const media = {
        mimeType,
        body: streamifier.createReadStream(fileBuffer)
      };

      const response = await this.drive.files.update({
        fileId: fileId,
        media: media,
        fields: 'id,webViewLink'
      });

      // Usar nuestro proxy en lugar de URL directa de Google Drive
      const directUrl = `/api/proxy/image/${fileId}`;
      
      return {
        id: response.data.id,
        viewUrl: response.data.webViewLink,
        directUrl
      };
    } catch (error) {
      console.error('Error al actualizar archivo en Google Drive:', error);
      throw error;
    }
  }
}

// Exportamos una instancia del servicio y el middleware de multer
const driveService = new GoogleDriveService();

module.exports = {
  driveService,
  uploadMiddleware: upload
};