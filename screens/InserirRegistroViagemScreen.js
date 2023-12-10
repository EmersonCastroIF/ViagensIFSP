import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Button, Text, TextInput, Checkbox, RadioButton, Snackbar, DatePicker } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
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
import { HomeContext } from "./HomeScreen";
import { useContext } from "react"
import { useRoute } from '@react-navigation/native';
import moment from 'moment';

registerTranslation('pt-BR', pt);

const db = SQLite.openDatabase("dados.db");

export default function InserirRegistroViagem() {
  const [localInput, setLocalInput] = useState('');
  const [descricaoInput, setDescricaoInput] = useState('');
  const [dataViagemInput, setDataViagemInput] = useState('');
  const [pessoas, setPessoas] = useState([]);
  const navigation = useNavigation();
  const route = useRoute();
  const { id_Viagem } = route ? route.params : {};
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(moment().toDate());
  //SQLITE

  const addViagem = (local, descricao, dataViagem) => {

    let dataAdjusted;
    dataAdjusted = moment(dataViagem).format('YYYY-MM-DD');

    db.transaction((tx) => {
      tx.executeSql(
        'insert into registro_viagem (local, descricao, data, id_viagem) values (?, ?, ?, ?)',
        [local, descricao, dataAdjusted, id_Viagem],
        (txObj, resultSet) => console.log('Registro inserido com sucesso'), // Callback executada em caso de sucesso na query
        (txObj, error) => console.log('Erro ao inserir registro: ', error) // Callback executada em caso de erro na query
      );
    });
    navigation.navigate('detalhe_viagem', {
      idViagem: id_Viagem
    })
  };

  //FIM SQLITE


  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
    });
    console.log({ id_Viagem });

    return unsubscribe;
  }, [navigation]);

  const [agree, setAgree] = useState(false);
  const [option, setOption] = useState(null);

  const schema = yup.object({
    local: yup.string().required('local é obrigatório'),
    descricao: yup.string().required('Descricao é obrigatório')
  }).required();

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      local: '',
      descricao: ''
    },
    resolver: yupResolver(schema)
  });

  const onSubmit = data => {
    console.log(data);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Controller
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Local"
              onChangeText={(text) => {
                onChange(text);
                setLocalInput(text); // Atualize o estado com o valor digitado
              }}
              value={value}
              style={{ width: 300 }}
            />
          )}
          name="local"
        />
        {errors.local && <Text style={styles.error}>{errors.local.message}</Text>}

        <Controller
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Descrição"
              multiline //Permite que o campo aceite várias linhas de texto
              numberOfLines={4} //Define a altura inicial do campo              
              blurOnSubmit={true} // Adicione esta linha
              onChangeText={(text) => {
                onChange(text);
                setDescricaoInput(text); // Atualize o estado com o valor digitado
              }}
              value={value}
              style={{
                width: 300,
                height: 100, // aumenta a altura inicial do campo
                borderColor: 'gray', // adicione estilos conforme necessário
                borderWidth: 1,
                marginTop: 10
              }}
            />
          )}
          name="descricao"
        />
        {errors.descricao && <Text style={styles.error}>{errors.descricao.message}</Text>}

        <Controller
          control={control}
          render={({ field: { onChange, value } }) => {
            const handleDateChange = (event, selectedDate) => {
              const currentDate = selectedDate ? moment(selectedDate).toDate() : date;
              setDate(currentDate);
              onChange(currentDate);
              setShowDatePicker(false);
            };

            return (
              <View>
                <Text style={{ alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>Data</Text>
                {Platform.OS === 'android' && (
                  <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <TextInput
                      editable={false}
                      value={value ? moment(value).format('DD/MM/YYYY') : ''}
                    />
                  </TouchableOpacity>
                )}
                {Platform.OS === 'ios' && (
                  <View style={{ alignItems: 'flex-start', justifyContent: 'center' }}>
                    <DateTimePicker
                      testID="dateTimePicker"
                      value={date ? moment(date).toDate() : new Date()}
                      mode={'date'}
                      locale="pt-BR"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      is24Hour={true}
                      onChange={handleDateChange}
                    />
                  </View>
                )}

                {showDatePicker && (
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={date ? moment(date).toDate() : new Date()}
                    mode={'date'}
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'default' : 'default'}
                    onChange={handleDateChange}
                  />
                )}
              </View>
            );
          }}
          name="data"
        />
        {errors.data && <Text style={styles.error}>{errors.data.message}</Text>}




        {/* Campos Novos */}

        <TouchableOpacity
          onPress={handleSubmit((data) => addViagem(data.local, data.descricao, data.data))}
          style={{
            backgroundColor: 'green',
            borderRadius: 10,
            marginTop: 30,
            alignItems: 'center',
            padding: 10
          }}
        >
          <Text style={{ color: 'white' }}>Confirmar Cadastro</Text>
        </TouchableOpacity>

        {/* <Button title = 'Registros da Viagem' onPress={()=>navigation.push("pessoa")} style={{ borderRadius: 4, marginTop: 8 }} >Registros da Viagem</Button> */}

        {/* Fim Campos Novos */}


      </View>
    </SafeAreaView>

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  error: { color: 'red' }
});