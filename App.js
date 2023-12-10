import { SafeAreaView, StyleSheet, View } from 'react-native';
import {  TextInput } from 'react-native-paper';
import { pt, registerTranslation } from 'react-native-paper-dates';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import InserirScreen from './screens/InserirScreen';
import InserirRegistroScreen from './screens/InserirRegistroViagemScreen';
import DetalheViagem from './screens/DetalheViagem';
import EditarScreen from './screens/EditarViagemScreen';
import SalvarFotos from './screens/InserirRegistroFoto';
import TirarFoto from './screens/TirarFoto';
import EditarRegistroViagem from './screens/EditarRegistroViagemScreen';
import { NavigationContainer } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

registerTranslation('pt-BR', pt);

export default function App() {
  

  return (


        <NavigationContainer>
          <Stack.Navigator initialRouteName='home'>            
            <Stack.Screen name='home' component={HomeScreen} options={{ title: 'Viagens Cadastradas' }} />
            <Stack.Screen name='pessoa' component={() => <PessoaScreen db={db} />} options={{ title: 'Pessoas' }} />
            <Stack.Screen name='inserir_viagens' component={InserirScreen} options={{ title: 'Inserir Viagens' }} />   
            <Stack.Screen name='inserir_registro_viagens' component={InserirRegistroScreen} options={{ title: 'Inserir Registro de Viagem' }} />           
            <Stack.Screen name='detalhe_viagem' component={() => <DetalheViagem/>} options={{ title: 'Registros da Viagem' }} />     
            <Stack.Screen name='editar_registro_viagem' component={() => <EditarRegistroViagem/>} options={{ title: 'Editar Registro Viagem' }} />              
            <Stack.Screen name='editar_viagem' component={() => <EditarScreen/>} options={{ title: 'Editar Viagem' }} />  
            <Stack.Screen name='salvar_fotos' component={() => <SalvarFotos/>} options={{ title: 'Galeria de Imagens' }} />         
            <Stack.Screen name='tirar_foto' component={() => <TirarFoto/>} options={{ title: 'Nova Foto' }} />                     
          </Stack.Navigator>

        </NavigationContainer> 


  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  error: { color: 'red' }
});