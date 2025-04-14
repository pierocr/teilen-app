import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";

// Parámetros: tamaño máximo y formatos permitidos
const MAX_FILE_SIZE = 1 * 1024 * 1024;
const ALLOWED_TYPES = ["jpg", "jpeg", "png"];

export async function seleccionarYPrepararImagen() {
  const resultado = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
    base64: false,
  });

  if (resultado.canceled) return null;

  let asset = resultado.assets[0];

  const extension = asset.uri.split(".").pop().toLowerCase();
  if (!ALLOWED_TYPES.includes(extension)) {
    alert("Formato no permitido. Usa JPG o PNG.");
    return null;
  }

  const fileInfo = await FileSystem.getInfoAsync(asset.uri);
  if (fileInfo.size > MAX_FILE_SIZE) {
    const comprimida = await ImageManipulator.manipulateAsync(
      asset.uri,
      [{ resize: { width: 1024 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    asset.uri = comprimida.uri;
  }

  const formData = new FormData();
  formData.append("imagen", {
    uri: asset.uri,
    type: "image/jpeg",
    name: `imagen_${Date.now()}.jpg`,
  });

  return { formData, uriPreview: asset.uri };
}
