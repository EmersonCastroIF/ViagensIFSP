import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, View } from 'react-native';
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
import { TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import moment from 'moment';


registerTranslation('pt-BR', pt);

const db = SQLite.openDatabase("dados.db");

export default function EditarViagem() {
  const [localInput, setLocalInput] = useState('');
  const [observacaoInput, setObservacaoInput] = useState('');
  const [dataViagemInput, setDataViagemInput] = useState('');
  const [dataFimViagemInput, setDataFimViagemInput] = useState('');
  const [pessoas, setPessoas] = useState([]);
  const navigation = useNavigation();
  const route = useRoute();
  const { id, local, obs, data, data_fim, edicao } = route ? route.params : {};
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDatePicker2, setShowDatePicker2] = useState(false);
  const [date, setDate] = useState(moment().toDate());
  const [dateFim, setDateFim] = useState(moment().toDate());
  //SQLITE

  const updateViagem = (local_received, obs_received, data_received, data_fim_received = new Date()) => {
    local_received = local_received || local;
    obs_received = obs_received || obs;

    let dataFimAdjusted;
    let dataInicioAdjusted;

    dataInicioAdjusted = moment(data_received).format('YYYY-MM-DD');
    dataFimAdjusted = moment(data_fim_received).format('YYYY-MM-DD');
    db.transaction((tx) => {
      tx.executeSql('update viagens set local = ?, observacao = ?, data = ?, data_fim = ? where id = ?', [local_received, obs_received, dataInicioAdjusted, dataFimAdjusted, id]);
    });
    // }

    navigation.navigate('home');
  };


  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log({ data });
      console.log({ data_fim });
      const dataFormatted = moment(data, 'YYYY-MM-DD').toDate();
      setDate(dataFormatted);
      const dataFormattedEnd = moment(data_fim, 'YYYY-MM-DD').toDate();
      setDateFim(dataFormattedEnd);

    });

    return unsubscribe;
  }, [navigation]);

  const [agree, setAgree] = useState(false);
  const [option, setOption] = useState(null);

  const schema = yup.object({
    local: yup.string().required('local é obrigatório'),
    observacao: yup.string().required('Observacao é obrigatório'),
    data: yup.date().required('Data é obrigatório'),
    dataFim: yup.date().required('Data Fim é obrigatório')
      .min(yup.ref('data'), 'A Data Fim não pode ser anterior à Data')
  }).required();

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      local: local || '',
      observacao: obs,
      data: data,
      dataFim: data_fim
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
              label="Observação"
              onChangeText={(text) => {
                onChange(text);
                setObservacaoInput(text); // Atualize o estado com o valor digitado
              }}
              value={value}
              editable={edicao === 1} // Aqui está a alteração
              style={{ width: 300 }}
            />
          )}
          name="observacao"
        />
        {errors.observacao && <Text style={styles.error}>{errors.observacao.message}</Text>}


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
              const currentDate = selectedDate ? moment(selectedDate).toDate() : dateFim;
              setDateFim(currentDate);
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
                      testID="dateTimePicker2"
                      value={dateFim ? moment(dateFim).toDate() : new Date()}
                      mode={'date'}
                      locale="pt-BR"
                      is24Hour={true}
                      onChange={handleDateChange}
                    />
                  </View>
                )}
                {showDatePicker2 && (
                  <DateTimePicker
                    testID="dateTimePicker2"
                    value={dateFim ? moment(dateFim).toDate() : new Date()}
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


        {edicao == 1 &&
          <TouchableOpacity
            onPress={handleSubmit((data) => updateViagem(data.local, data.observacao, data.data, data.dataFim))}
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
            navigation.navigate('home', {
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
    </SafeAreaView >

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  error: { color: 'red' }
});