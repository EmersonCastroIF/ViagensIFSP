import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet, FlatList, Button, Modal } from 'react-native';
// import { RNCamera } from 'react-native-camera';
import * as SQLite from 'expo-sqlite';
import * as Permissions from 'expo-permissions';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { useEffect } from 'react';
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

    const loadPhotosFromDatabase = async () => { // Adicione o parâmetro aqui
        db.transaction(
            (tx) => {
                tx.executeSql(
                    'SELECT * FROM registro_viagem_fotos WHERE id_registro_viagem = ?;', // Utilize a cláusula WHERE aqui
                    [id], // Passe o parâmetro aqui
                    (_, { rows: { _array } }) => setCapturedPhotos(_array.map(item => item.photo_path))
                );
            },
            (error) => {
                console.error('Erro ao carregar fotos do banco de dados:', error);
            }
        );
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadPhotosFromDatabase();
        });
        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const handleDeletePhoto = () => {
        // Aqui você pode adicionar a lógica para excluir a foto do banco de dados
        // Depois de excluir a foto, você pode chamar loadPhotosFromDatabase novamente para atualizar a lista de fotos
    
        db.transaction(
            (tx) => {
                tx.executeSql(
                    'DELETE FROM registro_viagem_fotos WHERE photo_path = ?;',
                    [selectedImage],
                    () => {
                        setModalVisible(false); // Feche a modal
                        loadPhotosFromDatabase(id); // Recarregue as fotos do banco de dados
                    }
                );
            },
            (error) => {
                console.error('Erro ao deletar foto do banco de dados:', error);
            }
        );
    };    


    if (hasPermission === null) {
        return <View />;
    }
    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }

    return (
        <View style={styles.container}>


            <Button
                style={styles.saveButtonText}
                onPress={() =>
                    navigation.navigate('tirar_foto', {
                        id: id
                    })}
                title="Adicionar"
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
                        <TouchableOpacity
                            style={[styles.button, styles.buttonDelete]} // Crie um novo estilo para o botão de excluir
                            onPress={() => handleDeletePhoto()} // Adicione a função que excluirá a foto do banco de dados
                        >
                            <Text style={styles.textStyle}>Excluir</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <View style={{ flex: 1 }}>

                <FlatList
                    key={5} // Modifique isso se o número de colunas for alterado
                    data={capturedPhotos}
                    numColumns={5}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => { setModalVisible(true); setSelectedImage(item); }}>
                            <Image source={{ uri: item }} style={{ width: 70, height: 70 }} />
                        </TouchableOpacity>
                    )}
                />
            </View>
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
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        marginTop: 10, // Adicione algum espaço entre o botão de fechar e o de excluir        
        backgroundColor: "#2196F3",
    },
    buttonDelete: {
        backgroundColor: "#FF0000", // Vermelho
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        marginTop: 10, // Adicione algum espaço entre o botão de fechar e o de excluir
    },
    textStyle: {
        color: "white", // Letra Branca
        fontWeight: "bold",
        textAlign: "center",
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