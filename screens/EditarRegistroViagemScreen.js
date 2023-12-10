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

export default function EditarViagem() {
  const [localInput, setLocalInput] = useState('');
  const [descricaoInput, setDescricaoInput] = useState('');
  const [dataViagemInput, setDataViagemInput] = useState('');
  const [pessoas, setPessoas] = useState([]);
  const navigation = useNavigation();
  const route = useRoute();
  const { id, viagem, local, desc, data, edicao } = route ? route.params : {};
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(moment().toDate());
  //SQLITE

  const updateViagem = (local_received, descricao_received, data_received = new Date()) => {
    local_received = local_received || local;
    descricao_received = descricao_received || desc;

    let dataAdjusted;
    dataAdjusted = moment(data_received).format('YYYY-MM-DD');


    db.transaction((tx) => {
      tx.executeSql('update registro_viagem set local = ?, descricao = ?, data = ? where id = ?', [local_received, descricao_received, dataAdjusted, id]);
    });


    navigation.navigate('detalhe_viagem', {
      idViagem: viagem
    });
  };

  //FIM SQLITE

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log({ viagem })
      const dataFormatted = moment(data, 'YYYY-MM-DD').toDate();
      setDate(dataFormatted);
    });

    console.log({ data });
    return unsubscribe;
  }, [navigation]);

  const [agree, setAgree] = useState(false);
  const [option, setOption] = useState(null);

  const schema = yup.object({
    local: yup.string().required('local é obrigatório'),
    descricao: yup.string().required('Descrição é obrigatório')
  }).required();

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      local: local || '',
      descricao: desc,
      data: data
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
              label={"Local"}
              onChangeText={(text) => {
                onChange(text);
                setLocalInput(text); // Atualize o estado com o valor digitado
              }}
              value={value}
              style={{ width: 300 }}
              editable={edicao === 1} // Aqui está a alteração
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
              editable={edicao === 1} // Aqui está a alteração
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

        {edicao == 1 &&
          <TouchableOpacity
            onPress={handleSubmit((data) => updateViagem(data.local, data.descricao, data.data))}
            style={{
              backgroundColor: 'green',
              borderRadius: 10,
              marginTop: 30,
              alignItems: 'center',
              padding: 10
            }}
          >
            <Text style={{ color: 'white' }}>Atualizar Viagem</Text>
          </TouchableOpacity>
        }

        <TouchableOpacity
          onPress={() =>
            navigation.navigate('detalhe_viagem', {
              idViagem: viagem
            })
          }
          style={{
            backgroundColor: 'rgba(79,142,247,0.8)',
            borderRadius: 10,
            marginTop: 5,
            alignItems: 'center',
            padding: 10
          }}
        >
          <Text style={{ color: 'white' }}>Voltar</Text>
        </TouchableOpacity>



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