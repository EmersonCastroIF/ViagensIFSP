import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, View, Modal, TouchableOpacity, TouchableWithoutFeedback, DatePickerIOS } from 'react-native';
import { Button, Text, TextInput, Checkbox, RadioButton, Snackbar } from 'react-native-paper';
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
import { NavigationContainer } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { HomeContext } from "./HomeScreen";
import { useContext } from "react"
import moment from 'moment';

registerTranslation('pt-BR', pt);

const db = SQLite.openDatabase("dados.db");

export default function InserirViagens() {
  const [localInput, setLocalInput] = useState('');
  const [observacaoInput, setObservacaoInput] = useState('');
  const [dataViagemInput, setDataViagemInput] = useState('');
  const [dataFimViagemInput, setDataFimViagemInput] = useState('');
  const [pessoas, setPessoas] = useState([]);
  const navigation = useNavigation();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDatePicker2, setShowDatePicker2] = useState(false);
  const [date, setDate] = useState(moment().toDate());
  const [dateEnd, setDateEnd] = useState(moment().toDate());

  //SQLITE

  const addViagem = (local, observacao, dataViagem, dataFimViagem) => {
    let dataInicioAdjusted;
    dataInicioAdjusted = moment(dataViagem).format('YYYY-MM-DD');

    let dataFimAdjusted;
    dataFimAdjusted = moment(dataFimViagem).format('YYYY-MM-DD');

    db.transaction((tx) => {
      tx.executeSql('insert into viagens (local, observacao, data, data_fim) values (?, ?, ?, ?)', [local, observacao, dataInicioAdjusted, dataFimAdjusted]);
    });

    navigation.navigate('home');

  };

  //FIM SQLITE



  const [agree, setAgree] = useState(false);
  const [option, setOption] = useState(null);

  const schema = yup.object().shape({
    local: yup.string().required('local é obrigatório'),
    observacao: yup.string().required('Observação é obrigatório'),
    data: yup.date().required('Data é obrigatório'),
    dataFim: yup.date().required('Data Fim é obrigatório')
      .min(yup.ref('data'), 'A Data Fim não pode ser anterior à Data')
  });

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      local: '',
      observacao: '',
      data: moment().format('YYYY-MM-DD'),
      dataFim: moment().format('YYYY-MM-DD')
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
              label="Observação"
              onChangeText={(text) => {
                onChange(text);
                setObservacaoInput(text); // Atualize o estado com o valor digitado
              }}
              value={value}
              style={{ width: 300 }}
            />
          )}
          name="observacao"
        />
        {errors.observacao && <Text style={styles.error}>{errors.observacao.message}</Text>}

        {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}> */}

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
                <Text style={{ alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>Data Início</Text>
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

        <Controller
          control={control}
          render={({ field: { onChange, value } }) => {
            const handleDateChange = (event, selectedDate) => {
              const currentDate = selectedDate ? moment(selectedDate).toDate() : dateEnd;
              setDateEnd(currentDate);
              onChange(currentDate);
              setShowDatePicker2(false);
            };

            return (
              <View>
                <Text style={{ alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>Data Fim</Text>
                {Platform.OS === 'android' && (
                  <TouchableOpacity onPress={() => setShowDatePicker2(true)}>
                    <TextInput
                      editable={false}
                      value={value ? moment(value).format('DD/MM/YYYY') : ''}
                    />
                  </TouchableOpacity>
                )}
                {Platform.OS === 'ios' && (
                  <View style={{ alignItems: 'flex-start', justifyContent: 'center' }}>
                    <DateTimePicker
                      value={dateEnd ? moment(dateEnd).toDate() : new Date()}
                      mode={'date'}
                      is24Hour={true}
                      locale="pt-BR"
                      onChange={handleDateChange}
                    />
                  </View>
                )}
                {showDatePicker2 && (
                  <DateTimePicker
                    testID="dateTimePicker2"
                    value={dateEnd ? moment(dateEnd).toDate() : new Date()}
                    mode={'date'}
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'default' : 'default'}
                    onChange={handleDateChange}
                  />
                )}
              </View>
            );
          }}
          name="dataFim"
        />
        {/* </View> */}
        {errors.dataFim && <Text style={styles.error}>{errors.dataFim.message}</Text>}

        {/* Campos Novos */}

        <TouchableOpacity
          onPress={handleSubmit((data) => addViagem(data.local, data.observacao, data.data, data.dataFim))}
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
    </SafeAreaView >

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  button: {
    backgroundColor: '#841584',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  error: { color: 'red' }
});