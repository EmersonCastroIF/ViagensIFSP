import { SafeAreaView } from "react-native-safe-area-context";
import { Button, StyleSheet, Text, View } from "react-native";
import { DataTable } from 'react-native-paper';
import { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';

export default function PessoaScreen({ navigation, db }) {
    const [registros, setRegistros] = useState([]);

    useEffect(() => {
        db.transaction((tx) => {
          tx.executeSql("select id, nome, phone from pessoa", [], (_, { rows }) => {
            const registrosArray = rows._array;
            setRegistros(registrosArray);
          });
        });
      }, []);

    return (
        <SafeAreaView style={styles.container}>
          <View>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Nome</DataTable.Title>
                <DataTable.Title>Telefone</DataTable.Title>
                <DataTable.Title>Excluir</DataTable.Title>
                <DataTable.Title>Editar</DataTable.Title>
              </DataTable.Header>
              {registros.map((registro) => (
                <DataTable.Row key={registro.id}>
                  <DataTable.Cell>{registro.nome}</DataTable.Cell>
                  <DataTable.Cell>{registro.phone}</DataTable.Cell>
                  <DataTable.Cell>
                    <Button title="Excluir" onPress={() => handleExcluir(registro.id)} />
                  </DataTable.Cell>
                  <DataTable.Cell>
                    <Button title="Editar" onPress={() => handleEditar(registro.id)} />
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </View>
        </SafeAreaView>
      );
    }

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    },
});