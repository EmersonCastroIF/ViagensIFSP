import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput, Checkbox, RadioButton, Snackbar } from 'react-native-paper';
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { useState, useEffect } from 'react';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { pt, registerTranslation } from 'react-native-paper-dates';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PessoaScreen from './PessoaScreen';
import * as SQLite from 'expo-sqlite';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { TouchableOpacity } from 'react-native';
import { DataTable } from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';
import { Alert } from 'react-native';
import moment from 'moment'; // importe a biblioteca moment.js

registerTranslation('pt-BR', pt);

const db = SQLite.openDatabase("dados.db");

export default function HomeScreen({ }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { idViagem } = route ? route.params : {};
  const [Viagens, setViagens] = useState([]);
  const [isViagensUpdated, setIsViagensUpdated] = useState(false);

  useEffect(() => {
    updateViagens();
  }, [isViagensUpdated]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      updateViagens();
    });
    // db.transaction((tx) => {
    //   tx.executeSql("drop table  registro_viagem ");
    // });
    console.log({ idViagem })
    return unsubscribe;
  }, [navigation]);

  const updateViagens = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "select id, local, descricao, data, id_viagem from registro_viagem where id_viagem = ? ORDER BY data DESC", [idViagem],
        (_, { rows }) => {
          const viagensFormatadas = rows._array.map(viagem => ({
            ...viagem,
            dataBR: moment(viagem.data, 'YYYY-MM-DD').format('DD/MM/YYYY')
          }));

          setViagens(viagensFormatadas);
        }
      );
      setIsViagensUpdated(true);
      console.log({ idViagem })
    });
  };

  const removerRegistro = (id) => {
    db.transaction((tx) => {
      // Primeiro - Deletar registros da tabela 'registro_viagem_fotos'
      tx.executeSql(
        `DELETE FROM registro_viagem_fotos
                WHERE id_registro_viagem IN (
                    SELECT id FROM registro_viagem
                    WHERE id_registro_viagem = ?
                )`,
        [id]
      );

      // Segundo - Deletar registros da tabela 'registro_viagem'
      tx.executeSql(
        `DELETE FROM registro_viagem WHERE id = ?`,
        [id]
      );
    });
    updateViagens();
  }

  const confirmDelete = (id) => {
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
  };

  const deleteViagem = (id) => {
    removerRegistro(id); //Chamando a função removerRegistro aqui
    updateViagens();
    console.log("Registro da Viagem deletada com ID: ", id);
    navigation.navigate('detalhe_viagem', {
      idViagem: idViagem
    });
  };

  //FIM SQLITE

  const renderViagens = () => {
    const viagensRenderizadas = Viagens.map((viagem, index) => (
      <DataTable>
        <DataTable.Row >
          <DataTable.Cell style={{ flex: 3 }}>
            <Button
              key={`viagem_${viagem.id}_editar`}
              onPress={() =>
                navigation.navigate('editar_registro_viagem', {
                  id: viagem.id,
                  viagem: viagem.id_viagem,
                  local: viagem.local,
                  desc: viagem.descricao,
                  data: viagem.data,
                  edicao: 0
                })
              }
              style={{ borderRadius: 4, marginTop: 8, marginLeft: 4 }}
            >
              {viagem.local}
            </Button>
          </DataTable.Cell>
          <DataTable.Cell style={{ flex: 3 }}>
            <Button
              key={`viagem_${viagem.id}_editar`}
              onPress={() =>
                navigation.navigate('editar_registro_viagem', {
                  id: viagem.id,
                  viagem: viagem.id_viagem,
                  local: viagem.local,
                  desc: viagem.descricao,
                  data: viagem.data,
                  edicao: 0
                })
              }
              style={{ borderRadius: 4, marginTop: 8, marginLeft: 4 }}
            >
              {viagem.dataBR}
            </Button>
          </DataTable.Cell>
          <DataTable.Cell style={{ flex: 1 }}>
            <Button
              key={`viagem_${viagem.id}_editar`}
              onPress={() =>
                navigation.navigate('editar_registro_viagem', {
                  id: viagem.id,
                  viagem: viagem.id_viagem,
                  local: viagem.local,
                  desc: viagem.descricao,
                  data: viagem.data,
                  edicao: 1
                })
              }
              style={{ borderRadius: 4, marginTop: 8, marginLeft: 4 }}
            >
              <FontAwesome name="edit" size={24} color="black" />
              <Text>Editar</Text>
            </Button>
          </DataTable.Cell>
          <DataTable.Cell style={{ flex: 1 }}>
            <Button
              key={`viagem_${viagem.id}_editar`}
              onPress={() =>
                navigation.navigate('editar_registro_viagem', {
                  id: viagem.id,
                  viagem: viagem.id_viagem,
                  local: viagem.local,
                  desc: viagem.descricao,
                  data: viagem.data,
                  edicao: 0
                })
              }
              style={{ borderRadius: 4, marginTop: 8, marginLeft: 4 }}
            >
              <FontAwesome name="eye" size={24} color="black" />
              <Text></Text>
            </Button>
          </DataTable.Cell>
          <DataTable.Cell style={{ flex: 1 }}>
            <Button
              key={`viagem_${viagem.id}salvar`}
              onPress={() =>
                navigation.navigate('salvar_fotos', {
                  id: viagem.id
                })
              }
              style={{ borderRadius: 4, marginTop: 8, marginLeft: 4 }}
            >
              <FontAwesome name="camera" size={24} color="black" />
            </Button>
          </DataTable.Cell>
          <DataTable.Cell style={{ flex: 1 }}>
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
      </DataTable>
    ));
    return viagensRenderizadas;
  };



  return (



    <View >

      <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 50, marginHorizontal: 10 }}>
        <TouchableOpacity
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            height: 50,
            width: '100%',
            borderRadius: 25,
            backgroundColor: 'rgba(79,142,247,0.8)',
            padding: 10,
          }}
          onPress={() => navigation.navigate('inserir_registro_viagens', { id_Viagem: idViagem })}
        >
          <Icon name="plus-circle" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </View>


      {/* Listagem de viagens */}
      <View>
        {
          Viagens.length > 0 ? renderViagens() : <Text>Não há registros cadastrados para essa viagem</Text>
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