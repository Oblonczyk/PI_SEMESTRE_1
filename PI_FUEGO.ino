#include <OneWire.h>
#include <DallasTemperature.h>

// -----------------------------------------
// 1. Definição dos Pinos de Hardware
// -----------------------------------------
const int pinoGas = 2;
const int buzzer = 3;
const int pinoTemp = 4;
const int ledVermelho = 5;

// Inicializa a comunicação do sensor de temperatura
OneWire oneWire(pinoTemp);
DallasTemperature sensorTemp(&oneWire);

// -----------------------------------------
// 2. Variáveis de Controle
// -----------------------------------------
int statusGas = 0;
float temperatura = 0.0;

// -----------------------------------------
// 3. Configuração Inicial (Setup)
// -----------------------------------------
void setup() {
  pinMode(ledVermelho, OUTPUT);
  pinMode(buzzer, OUTPUT);
  pinMode(pinoGas, INPUT);
  
  // O Buzzer Low Level inicia DESLIGADO recebendo HIGH
  digitalWrite(buzzer, HIGH); 
  digitalWrite(ledVermelho, LOW);
  
  Serial.begin(9600);
  sensorTemp.begin();
  
  Serial.println("=========================================");
  Serial.println(">>> SMART CAMPUS: MODULO LOCAL ATIVO <<<");
  Serial.println("=========================================");
  delay(1000);
}

// -----------------------------------------
// 4. Ciclo Principal (Loop)
// -----------------------------------------
void loop() {
  // Leitura do MQ-2
  statusGas = digitalRead(pinoGas);
  
  // Leitura do DS18B20
  sensorTemp.requestTemperatures(); 
  temperatura = sensorTemp.getTempCByIndex(0);

  // Impressão no Monitor Serial para validação durante a apresentação
  Serial.print("Qualidade Ar (0=Fumaça, 1=Limpo): ");
  Serial.print(statusGas);
  Serial.print(" | Temp: ");
  Serial.print(temperatura);
  Serial.println(" C");

  // Lógica de Emergência (Gás em LOW = Fumaça detectada)
  if (statusGas == LOW || temperatura > 50.0) {
    acionarAlerta();
  } else {
    sistemaSeguro();
  }

  // Pausa de meio segundo para estabilidade do Serial
  delay(500); 
}

// -----------------------------------------
// 5. Funções de Acionamento
// -----------------------------------------
void acionarAlerta() {
  digitalWrite(ledVermelho, HIGH);
  digitalWrite(buzzer, LOW); // LIGA o buzzer (Low Level)
  Serial.println(">>> ALERTA: EVACUAR O LOCAL! <<<");
}

void sistemaSeguro() {
  digitalWrite(ledVermelho, LOW);
  digitalWrite(buzzer, HIGH); // DESLIGA o buzzer (Low Level)
}