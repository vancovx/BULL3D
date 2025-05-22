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
    this.auth = null;
    this.initialize();
  }

  initialize() {
    try {
      const credentialsPath = path.join(__dirname, '../secrets/google-drive-credentials.json');
      const credentialsFile = fs.readFileSync(credentialsPath);
      const credentials = JSON.parse(credentialsFile).web;
  
      const client = new google.auth.OAuth2(
        credentials.client_id,
        credentials.client_secret,
        credentials.redirect_uris[0]
      );
  
      if (!credentials.refresh_token) {
        throw new Error('Falta el refresh token en el archivo de credenciales. Ejecuta getRefreshToken.js primero.');
      }
  
      client.setCredentials({ refresh_token: credentials.refresh_token });
      this.auth = client;
      
      this.drive = google.drive({ version: 'v3', auth: client });
      console.log('Google Drive API inicializada correctamente');
    } catch (error) {
      console.error('Error al inicializar Google Drive API:', error);
      throw error; 
    }
  }

  async getAccessToken() {
    try {
      const { token } = await this.auth.getAccessToken();
      return token;
    } catch (error) {
      console.error('Error al obtener access token:', error);
      throw error;
    }
  }

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

  async getDownloadUrl(fileId) {
    try {
      const fileMetadata = await this.getFileMetadata(fileId);
      
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

  // Subir un archivo a Google Drive y obtener URLs diferenciadas
  async uploadFile(fileBuffer, mimeType, fileName, folderId = null, isContentFile = false) {
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

      const fileId = response.data.id;
      
      // Para archivos de contenido descargable, devolver URL directa de Google Drive
      if (isContentFile) {
        return {
          id: fileId,
          viewUrl: response.data.webViewLink,
          directUrl: `/api/proxy/image/${fileId}`, // Para vista previa si es necesario
          downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}` // URL directa de descarga
        };
      } else {
        // Para imágenes, usar el proxy
        return {
          id: fileId,
          viewUrl: response.data.webViewLink,
          directUrl: `/api/proxy/image/${fileId}`
        };
      }
    } catch (error) {
      console.error('Error al subir archivo a Google Drive:', error);
      throw error;
    }
  }

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

  async deleteFile(fileId) {
    if (!fileId) {
      console.log('Se intentó eliminar un archivo con ID indefinido o nulo');
      return false;
    }

    try {
      console.log(`Intentando eliminar archivo con ID: ${fileId}`);
      
      const checkFile = await this.drive.files.get({
        fileId: fileId,
        fields: 'id,name,mimeType'
      }).catch(err => {
        console.log(`Error al verificar existencia del archivo ${fileId}:`, err.message);
        return null;
      });
      
      if (!checkFile) {
        console.log(`El archivo ${fileId} no existe o no es accesible`);
        return true;
      }
      
      console.log(`Archivo encontrado: ${checkFile.data.name} (${checkFile.data.mimeType})`);
      
      await this.drive.files.delete({
        fileId: fileId
      });
      
      console.log(`Archivo ${fileId} eliminado con éxito`);
      return true;
    } catch (error) {
      console.error(`Error detallado al eliminar archivo ${fileId}:`, error);
      
      if (error.response && error.response.status === 404) {
        console.log(`Archivo ${fileId} no encontrado, se considera ya eliminado`);
        return true;
      }
      
      if (error.response && error.response.status === 401) {
        console.error('Error de autenticación. Posible token expirado.');
      } else if (error.response && error.response.status === 403) {
        console.error('Error de permisos. No tienes permiso para eliminar este archivo.');
      }
      
      throw error;
    }
  }

  async updateFile(fileId, fileBuffer, mimeType, isContentFile = false) {
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

      // Para archivos de contenido, devolver URL de descarga directa
      if (isContentFile) {
        return {
          id: response.data.id,
          viewUrl: response.data.webViewLink,
          directUrl: `/api/proxy/image/${fileId}`,
          downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`
        };
      } else {
        return {
          id: response.data.id,
          viewUrl: response.data.webViewLink,
          directUrl: `/api/proxy/image/${fileId}`
        };
      }
    } catch (error) {
      console.error('Error al actualizar archivo en Google Drive:', error);
      throw error;
    }
  }
}

const driveService = new GoogleDriveService();

module.exports = {
  driveService,
  uploadMiddleware: upload
};