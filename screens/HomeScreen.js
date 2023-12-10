import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, View, FlatList, Animated, TouchableOpacity } from 'react-native';
import { Button, Text, TextInput, Checkbox, RadioButton, Snackbar, DatePicker } from 'react-native-paper';
import { ScrollView } from 'react-native';
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { useState, useEffect, useRef } from 'react';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { pt, registerTranslation } from 'react-native-paper-dates';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SQLite from 'expo-sqlite';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { DataTable } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Permissions from 'expo-permissions';
import { Alert } from 'react-native';
import moment from 'moment';
import { startOfDay } from 'date-fns';
import * as LocalAuthentication from 'expo-local-authentication';

registerTranslation('pt-BR', pt);

const db = SQLite.openDatabase("dados.db");

export default function HomeScreen({ }) {
  const [nomeInput, setNomeInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [Viagens, setViagens] = useState([]);
  const [isViagensUpdated, setIsViagensUpdated] = useState(false);
  const navigation = useNavigation();
  const animationRotate = useRef(new Animated.Value(0)).current;



  //SQLITE
  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql("create table if not exists viagens (id integer primary key not null, local  text  null, observacao text null, data DateTime null, data_fim DateTime null)");
    });
    db.transaction((tx) => {
      tx.executeSql("create table if not exists registro_viagem (id integer primary key not null, id_viagem integer  not null, local  text  null, descricao text null, data text null)");
    });
    db.transaction((tx) => {
      tx.executeSql("CREATE TABLE IF NOT EXISTS registro_viagem_fotos (id INTEGER PRIMARY KEY AUTOINCREMENT, id_registro_viagem INTEGER, photo_path TEXT)");
    });

    updateViagens();
  }, []);

  useEffect(() => {
    updateViagens();
  }, [isViagensUpdated]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      updateViagens();
      //         db.transaction((tx) => {
      //   tx.executeSql("drop table  registro_viagem ");
      // });
      // db.transaction((tx) => {
      //   tx.executeSql("drop table  viagens ");
      // });
      // db.transaction((tx) => {
      //   tx.executeSql("delete from  registro_viagem_fotos ");
      // });          
      // db.transaction((tx) => {
      //   tx.executeSql("drop table  registro_viagem_fotos ");
      // });                 
    });

    return unsubscribe;
  }, [navigation]);

  if (__DEV__) {
    console.log = () => {}
    console.error = () => {}
    console.warn = () => {}
  }

  const moment = require('moment');

  const interpolateRotation = animationRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const animatedStyle = {
    transform: [{ rotate: interpolateRotation }]
  }

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(animationRotate, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.timing(animationRotate, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true
      }),
    ]).start(() => navigation.navigate('inserir_viagens'))
  }

  const updateViagens = () => {
    db.transaction((tx) => {
      tx.executeSql("select id, local, observacao, data, data_fim from viagens", [], (_, { rows }) => {
        const viagensAtualizadas = rows._array.map(viagem => {
          let dataInicio = moment(viagem.data).format('DD/MM');
          let dataFim = moment(viagem.data_fim).format('DD/MM');

          viagem.data_concatenada = `${dataInicio} a ${dataFim}`;
          return viagem;
        });

        setViagens(viagensAtualizadas);
      });
    });
    setIsViagensUpdated(true);
  };

  const removerRegistro = (id) => {
    db.transaction((tx) => {

      // Primeiro - Deletar registros da tabela 'registro_viagem_fotos'
      tx.executeSql(
        `DELETE FROM registro_viagem_fotos
                WHERE id_registro_viagem IN (
                    SELECT id FROM registro_viagem
                    WHERE id_viagem = ?
                )`,
        [id]
      );

      // Segundo - Deletar registros da tabela 'registro_viagem'
      tx.executeSql(
        `DELETE FROM registro_viagem WHERE id_viagem = ?`,
        [id]
      );

      // Terceiro - Deletar registros da tabela 'viagens'
      tx.executeSql(
        `DELETE FROM viagens WHERE id = ?`,
        [id]
      );

    }, (error) => {
      console.error("Erro ao tentar deletar os registros: ", error);
    }, () => {
      updateViagens();
    });
  }

  const confirmDelete = async (id) => {
    const hasHardwareAsync = await LocalAuthentication.hasHardwareAsync();

    if (hasHardwareAsync) {
      const isEnrolledAsync = await LocalAuthentication.isEnrolledAsync();

      if (isEnrolledAsync) {
        const authenticateAsync = await LocalAuthentication.authenticateAsync();

        if (authenticateAsync.success) {
          Alert.alert(
            "Confirmação de exclusão",
            "Tem certeza de que deseja excluir o Registro da Viagem?",
            [
              {
                text: "Não",
                onPress: () => console.log("Cancel Pressed"),
                style: "cancel"
              },
              { text: "Sim", onPress: () => deleteViagem(id) }
            ],
            { cancelable: false }
          );
        }
      }
    }
  };

  const deleteViagem = (id) => {
    removerRegistro(id); //Chamando a função removerRegistro aqui
    console.log("Registro da Viagem deletada com ID: ", id);
  };

  function handleEditPress(viagem) {
    return async function () {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();

      if (hasHardware) {
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (isEnrolled) {
          const result = await LocalAuthentication.authenticateAsync();

          if (result.success) {
            navigation.navigate('editar_viagem', {
              id: viagem.id,
              local: viagem.local,
              obs: viagem.observacao,
              data: viagem.data,
              data_fim: viagem.data_fim,
              edicao: 1
            });
          } else {
            // handle authentication failure
          }
        } else {
          // handle case where biometrics are not enrolled
        }
      } else {
        // handle case where hardware is not available
      }
    }
  }

  const onSubmit = data => {
    console.log(data);
  }

  const renderViagens = () => {
    return (
      <FlatList
        data={Viagens}
        keyExtractor={item => `viagem_${item.id}_editar`}
        persistentScrollbar={true}
        nestedScrollEnabled={true}
        renderItem={({ item: viagem }) => (
          <DataTable.Row style={{ height: 100 }}>
            <DataTable.Cell style={{ flex: 3 }}>
              <TouchableOpacity
                key={`viagem_${viagem.id}_editar`}
                style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start', padding: 2 }}
                onPress={() => navigation.navigate('detalhe_viagem', { idViagem: viagem.id })}
              >
                <View><Text style={{ margin: 0 }}>{viagem.local}</Text></View>
                <View><Text style={{ margin: 0 }}>{viagem.data_concatenada}</Text></View>
              </TouchableOpacity>
            </DataTable.Cell>
            <DataTable.Cell style={{ flex: 0.25 }} numeric>
              <Button
                style={{
                  borderRadius: 50,
                  padding: 0,
                  justifyContent: 'center',
                  backgroundColor: moment().isBefore(moment(viagem.data_fim).add(1, 'days')) ? '#add8e6' : '#90ee90'
                }}
              >
                {moment().isBefore(moment(viagem.data_fim).add(1, 'days')) ?
                  <FontAwesome name="hourglass-half" size={18} color="black" /> :
                  <FontAwesome name="check-circle" size={18} color="black" />
                }
                <Text style={{ color: 'black' }}>
                  {moment().isBefore(moment(viagem.data_fim).add(1, 'days')) ? '' : ''}
                </Text>
              </Button>
            </DataTable.Cell>
            <DataTable.Cell style={{ flex: 1 }} numeric>
              <Button
                key={`viagem_${viagem.id}_editar`}
                onPress={() =>
                  navigation.navigate('editar_viagem', {
                    id: viagem.id,
                    local: viagem.local,
                    obs: viagem.observacao,
                    data: viagem.data,
                    data_fim: viagem.data_fim,
                    edicao: 0
                  })
                }
                style={{ borderRadius: 4, marginTop: 8, marginLeft: 4 }}
              >
                <FontAwesome name="eye" size={24} color="black" />
              </Button>
            </DataTable.Cell>
            <DataTable.Cell style={{ flex: 1 }} numeric>
              <Button
                key={`viagem_${viagem.id}_editar`}
                onPress={handleEditPress(viagem)}
                style={{ borderRadius: 4, marginTop: 8, marginLeft: 4 }}
              >
                <FontAwesome name="edit" size={24} color="black" />
                <Text>Editar</Text>
              </Button>
            </DataTable.Cell>
            <DataTable.Cell style={{ flex: 1 }} numeric>
              <Button
                key={`viagem_${viagem.id}_deletar`}
                onPress={() => confirmDelete(viagem.id)}
                style={{ borderRadius: 4, marginTop: 8, marginLeft: 4 }}
              >
                <FontAwesome name="trash" size={24} color="black" />
                <Text></Text>
              </Button>
            </DataTable.Cell>
          </DataTable.Row>
        )}
      />
    );
  };

  return (

    <View>

      <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 50, marginHorizontal: 10, backgroundColor: 'rgba(79,142,247,1)', borderRadius: 25 }}>
        <Animated.View style={animatedStyle}>
          <TouchableOpacity
            activeOpacity={1}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              height: 50,
              width: '100%',
              borderRadius: 25,
              backgroundColor: 'rgba(79,180,247,0.8)',
              padding: 10,
            }}
            onPress={animatePress}
          >
            <Icon name="plus-circle" size={30} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Listagem de viagens */}
      <View>
        {
          Viagens.length > 0 ? renderViagens() : <Text>Não há viagens cadastradas</Text>
        }
      </View>







    </View>


  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  error: { color: 'red' }
});