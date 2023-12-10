import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet, FlatList, Button, Modal } from 'react-native';
// import { RNCamera } from 'react-native-camera';
import * as SQLite from 'expo-sqlite';
import * as Permissions from 'expo-permissions';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import {  useEffect } from 'react';
import { Camera } from 'expo-camera';
// import { PermissionsAndroid, Platform } from 'react-native';

const db = SQLite.openDatabase("dados.db");

const PhotoCaptureComponent = () => {
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [photos, setPhotos] = useState([]);
  const cameraRef = useRef(null);
  const route = useRoute();
  const { id } = route ? route.params : {};
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigation = useNavigation();
  const [total, setTotal] = useState(0);


  const updateTotal = () => {
    setTotal(capturedPhotos.length);
  };

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    setTotal(capturedPhotos.length);
  }, [capturedPhotos]);
  

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const capturePhoto = async () => {
    console.log("Iniciou Captura");
    if (cameraRef.current) {
        console.log("Entrou");
      try {
        const options = { quality: 0.5, base64: true };
        const data = await cameraRef.current.takePictureAsync(options);

        setCapturedPhotos((prevPhotos) => [...prevPhotos, data.uri]);     

      } catch (error) {
        console.error('Erro ao capturar foto:', error);
      }
    }
  };


  
  const savePhotosToDatabase = async () => {
    console.log("Iniciou");
    console.log(capturedPhotos.length )
    if (capturedPhotos.length > 0 ) {
      db.transaction(
        (tx) => { 
          capturedPhotos.forEach((photoPath) => {
            tx.executeSql('INSERT INTO registro_viagem_fotos (photo_path, id_registro_viagem ) VALUES (?, ? );', [photoPath, id]);
          });
        },
        (error) => {
          console.error('Erro ao salvar fotos no banco de dados:', error);
        },
        () => {
          console.log('Fotos salvas com sucesso!');
          setCapturedPhotos([]); // Limpa a lista de fotos após salvar no banco
        }
      );
    }
    navigation.navigate('salvar_fotos', { 
      id: id})

  };


  return (
    <View style={styles.container}>
      
      <Button
      style={styles.saveButtonText}
        onPress={savePhotosToDatabase}
        title="Finalizar Capturas"  
        />

      <Button
        style={styles.saveButtonText}
        onPress={capturePhoto}
        title={`Capturar`} // Adicione a variável total aqui
      />
      <Button
        style={styles.saveButtonText}
        title={`Total de Fotos Capturadas : ${total}`} // Adicione a variável total aqui
      />      
        <Button
        style={styles.saveButtonText}
        onPress={() => 
            navigation.navigate('salvar_fotos', { 
                id: id
            })}
        title="Voltar"  
        />            


<Modal
    animationType="slide"
    transparent={true}
    visible={modalVisible}
    onRequestClose={() => {
      setModalVisible(!modalVisible);
    }}
  >
    <View style={styles.centeredView}>
      <View style={styles.modalView}>
        <Image source={{ uri: selectedImage }} style={{ width: "100%", height: "100%" }} />
        <TouchableOpacity
          style={[styles.button, styles.buttonClose]}
          onPress={() => setModalVisible(!modalVisible)}
        >
          <Text style={styles.textStyle}>Fechar</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
  
<View style={{ flex: 1 }}>
<Camera style={{ flex: 1 }} type={type} ref={cameraRef}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            flexDirection: 'row',
          }}>
          <TouchableOpacity
            style={{
              flex: 0.1,
              alignSelf: 'flex-end',
              alignItems: 'center',
            }}
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}>
            <Text style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
              {' '}
              Flip{' '}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 0.1,
              alignSelf: 'flex-end',
              alignItems: 'center',
            }}
            onPress={capturePhoto}>
            <Text style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
              {' '}
              Capture{' '}
            </Text>
          </TouchableOpacity>
        </View>
      </Camera>

    </View>
      {/* <TouchableOpacity style={styles.saveButton} onPress={savePhotosToDatabase}>
        <Text style={styles.saveButtonText}>Salvar Fotos</Text>
      </TouchableOpacity> */}

 
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
   
  },
  camera: {
    flex: 1,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  photoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  thumbnail: {
    width: 50,
    height: 50,
    margin: 5,
  },
  captureButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
  },
  captureButtonText: {
    fontSize: 16,
    color: 'black',
  },
  saveButton: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: 'green',
    borderRadius: 5,
    padding: 10,
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
  },
  modalView: {
    width: '80%', // Isto define a largura para 80% da largura da tela
    height: '60%', // Isto define a altura para 60% da altura da tela
    // outras propriedades de estilo
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },  
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }  
});

export default PhotoCaptureComponent;