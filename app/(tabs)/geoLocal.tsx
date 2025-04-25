import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function GeoLocalScreen() {
  const [coord, setCoord] = useState<{ latitude: number; longitude: number } | null>(null);
  //variavel para a obtenção de coordenadas
  const [erro, setErro] = useState<string | null>(null);
  //variavel para a obtenção de erros
  const [local, setLocal] = useState<string | null>(null);
  //variavel para a obtenção da localização

  useEffect(() => {
    if (!navigator.geolocation) {
      setErro('Geolocalização não suportada pelo navegador.');
      return;
      /*fornece através da propriedade geolocation do navigator acesso a api do navegador 
      para verificar se o mesmo possui suporte a geolocalização*/
    }

    //método que ira obter a posição atual do dispositivo.
    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        const coords = {
          latitude: posicao.coords.latitude,
          longitude: posicao.coords.longitude,
        };
        setCoord(coords); //o setCoord recebe o valor de latitude e longitude recebidos pelo const coords
      },
      (error) => {
        setErro('Erro ao obter localização: ' + error.message);
      }
    );
  }, []);

  useEffect(() => {
    if(coord) {
        const buscarEndereco = async () => {
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${coord.latitude}&lon=${coord.longitude}&format=json`,
                    /*chama a API Nomination (OpenStreetMap) e converte as variaveis de longitude e latitude 
                    em um endereço retornado no formato json*/
                    {
                        headers: {
                            'User-Agent': 'geoLocal/1.0 (luciano.sousa31@etec.sp.gov.br)'
                            //necessario para se identificar para a api e evitar ser bloqueado
                        },
                    }
                );
                const data = await response.json();
                setLocal(data.display_name || 'Endereço não encontrado');
                /*atualiza o setLocal com o endereço obtido pela api e convertida de json para um objeto 
                javascript e exibido mo display_name. caso o display_name não seja usado 
                sera exibida a mensagem de endereço não encontrado*/
            } catch (error) {
                setErro('Erro ao buscar endereço')
                //erro pego e tratado pelo catch através do setErro
            }
        };

        buscarEndereco();
        //chama a função que faz a requisição para a api
    }
  }, [coord] /*quando o cord é atualizado o useEffect   chama a função acima*/ )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Localização Atual</Text>
      {coord ? 
      //verifficação de if-else feita a partir de um operador ternário ("?"")
      //caso o "coord" tenha algum valor executa o bloco abaixo, caso o valor for null, executa o bloco depois do ":"
      (
        <>
          <Text style={styles.coordenadas}>Latitude: {coord.latitude}</Text>
          <Text style={styles.coordenadas}>Longitude: {coord.longitude}</Text>
          {local && <Text style={styles.localizacao}>Endereço: {local} </Text>}
        </>
        /*o "&&" verifica se o "local" possui um valor, se ele tiver, executa o "Text"*/
      ) : (
        <Text className='endereco' style={styles.status}>{erro || 'Obtendo localização...'}</Text>
        //exibe "obtendo localização", caso ocorra um erro durante o processo, exibe o "erro"
      )}
    </View>
  );
}

/*o "tabBarIcon" define o icone da aba. A atribuição de um valor para o color/size não é necessaria
mas caso não seja usada ambos são identificados com o tipo "any" o que é considerado perigoso pelo typescript*/
GeoLocalScreen.tabBarIcon = ({ color, size }: {color: string; size:number}) => (
    <Ionicons name="location-outline" size={size} color={color} />
  );  

//define o texto exibido abaixo do icone
GeoLocalScreen.tabBarLabel = "Localização";

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: 'white' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  coordenadas: { fontSize: 18, marginBottom: 10 },
  localizacao: { fontSize: 18, marginTop: 10, letterSpacing: 2, },
  status: { fontSize: 16, fontStyle: 'italic' },
});
