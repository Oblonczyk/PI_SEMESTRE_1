# Smart Campus: Sistema IoT de Monitoramento e Prevenção de Incêndios

---

## 👥 Integrantes da Equipe

O desenvolvimento deste projeto foi realizado pela equipe de Engenharia e Tecnologia da **Unifeob**:

* **Isabela Carolina** - RA: 26000124
* **Vinycius Oblonczyk** - RA: 22001650
* **Diego Tardelli** - RA: 22001752
* **Jackeline Kanekiyo** - RA: 22001803
* **Geovana Sorg** - RA: 22001825

---

Este repositório contém o código-fonte, a arquitetura de hardware e a interface web do projeto **Smart Campus**, desenvolvido para atuar como um sistema autônomo e em tempo real de segurança e prevenção de incêndios, aplicado especificamente ao **Laboratório de Informática 3**.

O sistema coleta dados ambientais localmente (Edge Computing), gerencia alertas visuais e sonoros de emergência de forma resiliente, transmite as leituras para uma plataforma em nuvem (ThingSpeak) e exibe os dados consolidados em um painel executivo e responsivo.

---

## 🚀 Arquitetura do Sistema

O projeto é dividido em três camadas principais interconectadas, formando um pipeline de dados ponta a ponta:

### 1. Camada de Hardware (Edge Computing)
Destaque para a resiliência física: o alarme local funciona de forma totalmente autônoma, independente da estabilidade da rede de internet.
* **Microcontrolador Central:** Arduino Uno, responsável por gerenciar os sensores, interpretar a lógica de segurança e disparar os atuadores.
* **Sensor de Gás e Fumaça (MQ-2):** Opera em modo lógico digital. Retorna sinal `1` (HIGH) em condições normais e `0` (LOW) ao detectar fumaça ou gases inflamáveis.
* **Sensor de Temperatura (DS18B20):** Sensor digital subaquático e encapsulado de alta precisão que utiliza o barramento **OneWire**. O sistema possui um limite rígido (threshold) de **50.0°C** para o disparo de emergência.
* **Módulo de Comunicação:** Módulo WiFi ESP8266 (ESP-01) acoplado a um **ESP-01 Adapter v1.0** para compatibilização de níveis lógicos (5V do Arduino para 3.3V do chip).
* **Atuadores Locais:** Um LED Vermelho de alerta visual e um **Buzzer Low-Level** (ativado com sinal `LOW`) para o alarme sonoro de evacuação.

### 2. Camada de Comunicação e Nuvem (Pipeline de Dados)
Desenvolvida com foco em otimização de banda, estabilidade de buffer e gerenciamento de energia:
* **Baud Rate Dinâmico:** No setup do Arduino, o ESP-01 é inicializado em 115200 baud (padrão de fábrica) para receber o comando de configuração definitiva `AT+UART_DEF=9600,8,1,0,0`. Em seguida, a comunicação passa a operar a **9600 baud**, eliminando a perda de pacotes comum no uso da biblioteca `SoftwareSerial`.
* **Protocolo de Rede:** O Arduino envia os dados via requisições HTTP **GET** otimizadas (mais leves que o método POST), reduzindo o uso de memória do microcontrolador.
* **Controle de Taxa (Rate Limiting):** As leituras são transmitidas em intervalos estritos de **20 segundos**, respeitando os limites da API gratuita do **ThingSpeak** e evitando travamentos por estouro de buffer do ESP-01.
* **Destino dos Dados:** ThingSpeak (Field 3 para status de gás e Field 4 para a temperatura).

### 3. Camada de Interface (Frontend / Dashboard)
Painel de controle executivo para monitoramento e tomada de decisão:
* **Tecnologias:** Vanilla Web (HTML5, CSS3 com Media Queries para responsividade mobile e JavaScript puro).
* **Consumo de API:** O JavaScript realiza um *polling* assíncrono a cada 20 segundos na API REST do ThingSpeak usando uma chave pública.
* **Lógica de Detecção de Anomalias (Outliers):** O frontend valida os dados em tempo real. Caso o status do gás seja `0` ou a temperatura ultrapasse `50.0°C`, a interface ativa o **Banner Global de Emergência**, aplica estilos visuais críticos (`critical-alert`) no card do laboratório e insere uma linha dinamicamente no **Histórico de Alertas**.
* **Visualização Gráfica:** Utilização da biblioteca **Chart.js** para plotar a curva histórica das últimas leituras de temperatura com carimbo de data/hora extraído do servidor.

---

## 🛠️ Esquema de Ligação dos Pinos (Arduino Uno)

| Componente/Pino | Tipo | Pino no Arduino | Detalhe Técnico |
| :--- | :--- | :--- | :--- |
| **Sensor MQ-2** | Entrada Digital | `Pin 2` | Lógica Invertida (0 = Fumaça) |
| **Buzzer Local** | Saída Digital | `Pin 3` | Ativo em nível lógico LOW |
| **Sensor DS18B20** | Entrada Digital | `Pin 4` | Protocolo OneWire |
| **LED Vermelho** | Saída Digital | `Pin 5` | Alerta Visual Local |
| **ESP-01 (TX)** | Serial (RX) | `Pin 6` | Atua como SoftwareSerial RX |
| **ESP-01 (RX)** | Serial (TX) | `Pin 7` | Atua como SoftwareSerial TX (Protegido pelo Adaptador) |

---

## ⚙️ Como Executar o Projeto

1. **Hardware:** Monte o circuito seguindo a pinagem descrita. Certifique-se de que o ESP-01 está corretamente assentado no adaptador v1.0 com a antena virada para fora.
2. **Firmware:** Abra o código do Arduino na IDE, insira as credenciais do seu Wi-Fi (`ssid` e `pass`) e a sua `Write API Key` do ThingSpeak. Faça o upload.
3. **Frontend:** No arquivo `script.js`, insira o ID do seu canal na variável `CHANNEL_ID`. Abra o arquivo `index.html` em qualquer navegador moderno.
