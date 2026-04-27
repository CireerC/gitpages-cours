---
layout: course
title: "Systèmes embarqués"
semestre: "S7"
type_cours: "embarqué"
tags: ["STM32", "FreeRTOS", "I2C", "SPI", "UART", "CAN", "interruptions", "DMA", "temps réel"]
---

## Introduction

Les systèmes embarqués sont des systèmes informatiques dédiés à une tâche spécifique, intégrés dans un appareil plus large. Contrairement à un ordinateur généraliste, ils sont contraints en ressources (mémoire, énergie, temps réel) et doivent répondre à des exigences déterministes.

---

## Microcontrôleurs vs Microprocesseurs

| Critère | Microcontrôleur (MCU) | Microprocesseur (MPU) |
|---------|----------------------|----------------------|
| Intégration | CPU + RAM + Flash + périphériques | CPU seul |
| RAM | Kilo-octets à quelques Mo | Giga-octets (via DDR) |
| OS | Bare-metal ou RTOS léger | Linux, RTOS complet |
| Consommation | µA à quelques mA | Quelques W |
| Déterminisme | Oui (cycles précis) | Limité (cache, pipeline) |
| Exemples | STM32, AVR, PIC, ESP32 | Raspberry Pi CM4, iMX8 |

---

## Architecture ARM Cortex-M

```
                    ┌─────────────────────────────────┐
                    │          Cortex-M4               │
                    │  ┌───────┐  ┌──────────────┐    │
                    │  │  CPU  │  │  FPU (optio.)│    │
                    │  │  DSP  │  │  MPU         │    │
                    │  └───┬───┘  └──────────────┘    │
                    │      │ AHB bus                    │
                    └──────┼──────────────────────────-─┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
           Flash ROM     SRAM        Périphériques
           (jusqu'à     (jusqu'à    (GPIO, USART,
           2 Mo)         512 Ko)    SPI, I2C, TIM...)
```

**Niveaux de privilège :**
- **Thread mode** (unprivileged) : code utilisateur
- **Handler mode** (privileged) : ISR, kernel
- **MSP** (Main Stack Pointer) / **PSP** (Process Stack Pointer)

---

## STM32 — Développement avec HAL

### GPIO — Entrées/Sorties

```c
#include "stm32f4xx_hal.h"

// Initialisation (généralement faite par CubeMX)
GPIO_InitTypeDef GPIO_InitStruct = {0};
__HAL_RCC_GPIOA_CLK_ENABLE();

GPIO_InitStruct.Pin   = GPIO_PIN_5;     // PA5 = LED
GPIO_InitStruct.Mode  = GPIO_MODE_OUTPUT_PP;
GPIO_InitStruct.Pull  = GPIO_NOPULL;
GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_LOW;
HAL_GPIO_Init(GPIOA, &GPIO_InitStruct);

// Utilisation
HAL_GPIO_WritePin(GPIOA, GPIO_PIN_5, GPIO_PIN_SET);    // LED ON
HAL_GPIO_WritePin(GPIOA, GPIO_PIN_5, GPIO_PIN_RESET);  // LED OFF
HAL_GPIO_TogglePin(GPIOA, GPIO_PIN_5);                 // Toggle

// Lecture bouton (PA0, pull-up interne)
if (HAL_GPIO_ReadPin(GPIOA, GPIO_PIN_0) == GPIO_PIN_RESET) {
    // Bouton pressé (actif bas avec pull-up)
}
```

### Interruptions (NVIC + EXTI)

```c
// Activation de l'interruption externe sur PA0 (flanc descendant)
GPIO_InitStruct.Pin  = GPIO_PIN_0;
GPIO_InitStruct.Mode = GPIO_MODE_IT_FALLING;
GPIO_InitStruct.Pull = GPIO_PULLUP;
HAL_GPIO_Init(GPIOA, &GPIO_InitStruct);

HAL_NVIC_SetPriority(EXTI0_IRQn, 2, 0);  // Priorité 2
HAL_NVIC_EnableIRQ(EXTI0_IRQn);

// Callback (dans stm32f4xx_it.c)
void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin) {
    if (GPIO_Pin == GPIO_PIN_0) {
        button_pressed = 1;  // Flag pour la boucle principale
    }
}
```

> **Règle d'or :** les ISR doivent être courtes — lever un flag, écrire dans un buffer, jamais de HAL_Delay() ni d'opération longue.

### Timers

```c
// Timer TIM2 en mode PWM (génération de signal audio ou servo)
TIM_HandleTypeDef htim2;
htim2.Instance               = TIM2;
htim2.Init.Prescaler         = 84 - 1;    // 84 MHz / 84 = 1 MHz
htim2.Init.Period            = 1000 - 1;  // 1 MHz / 1000 = 1 kHz
htim2.Init.ClockDivision     = TIM_CLOCKDIVISION_DIV1;
htim2.Init.CounterMode       = TIM_COUNTERMODE_UP;
HAL_TIM_PWM_Init(&htim2);

// Duty cycle sur canal 1 (0-999 = 0-100%)
__HAL_TIM_SET_COMPARE(&htim2, TIM_CHANNEL_1, 500);  // 50% duty
HAL_TIM_PWM_Start(&htim2, TIM_CHANNEL_1);
```

---

## Protocoles de communication

### UART (Universal Asynchronous Receiver-Transmitter)

```c
// Configuration : 115200 bauds, 8N1
UART_HandleTypeDef huart2;
huart2.Instance          = USART2;
huart2.Init.BaudRate     = 115200;
huart2.Init.WordLength   = UART_WORDLENGTH_8B;
huart2.Init.StopBits     = UART_STOPBITS_1;
huart2.Init.Parity       = UART_PARITY_NONE;
huart2.Init.Mode         = UART_MODE_TX_RX;
HAL_UART_Init(&huart2);

// Envoi (bloquant)
char msg[] = "Hello STM32\r\n";
HAL_UART_Transmit(&huart2, (uint8_t*)msg, strlen(msg), HAL_MAX_DELAY);

// Réception non bloquante par interruption
uint8_t rx_buf[64];
HAL_UART_Receive_IT(&huart2, rx_buf, 64);

void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart) {
    if (huart->Instance == USART2) {
        process_command(rx_buf);
        HAL_UART_Receive_IT(&huart2, rx_buf, 64);  // Re-arm
    }
}
```

### I²C — Inter-Integrated Circuit

```c
// Lecture d'un capteur de température BMP280 (adresse 0x76)
#define BMP280_ADDR   (0x76 << 1)   // STM32 HAL utilise l'adresse décalée
#define BMP280_REG_ID  0xD0
#define BMP280_REG_CTRL 0xF4

uint8_t chip_id;
// Lire le registre ID
HAL_I2C_Mem_Read(&hi2c1, BMP280_ADDR, BMP280_REG_ID,
                  I2C_MEMADD_SIZE_8BIT, &chip_id, 1, HAL_MAX_DELAY);
// chip_id doit valoir 0x60

// Configurer le mode de mesure
uint8_t config = 0x27;  // Oversampling x1, mode normal
HAL_I2C_Mem_Write(&hi2c1, BMP280_ADDR, BMP280_REG_CTRL,
                   I2C_MEMADD_SIZE_8BIT, &config, 1, HAL_MAX_DELAY);
```

### SPI — Serial Peripheral Interface

```c
// Envoi/réception simultané (full duplex)
uint8_t tx_data[] = {0x01, 0x02, 0x03};
uint8_t rx_data[3] = {0};

HAL_GPIO_WritePin(CS_GPIO_Port, CS_Pin, GPIO_PIN_RESET);   // CS bas
HAL_SPI_TransmitReceive(&hspi1, tx_data, rx_data, 3, HAL_MAX_DELAY);
HAL_GPIO_WritePin(CS_GPIO_Port, CS_Pin, GPIO_PIN_SET);     // CS haut
```

### CAN Bus

```c
// Envoi d'un message CAN (ID 0x123, 4 octets de données)
CAN_TxHeaderTypeDef txHeader;
uint8_t txData[4] = {0x12, 0x34, 0x56, 0x78};
uint32_t txMailbox;

txHeader.StdId              = 0x123;
txHeader.RTR                = CAN_RTR_DATA;
txHeader.IDE                = CAN_ID_STD;
txHeader.DLC                = 4;
txHeader.TransmitGlobalTime = DISABLE;

HAL_CAN_AddTxMessage(&hcan1, &txHeader, txData, &txMailbox);
```

---

## DMA — Accès Mémoire Direct

Le DMA transfère des données **sans impliquer le CPU** — idéal pour l'ADC, UART, SPI à haut débit.

```c
// ADC avec DMA circulaire — acquisition continue sur 4 canaux
uint16_t adc_buffer[4];  // 1 valeur par canal

// Démarrer l'ADC avec DMA (le buffer est mis à jour automatiquement)
HAL_ADC_Start_DMA(&hadc1, (uint32_t*)adc_buffer, 4);

// Callback appelé à chaque conversion complète
void HAL_ADC_ConvCpltCallback(ADC_HandleTypeDef* hadc) {
    // adc_buffer[0] = canal 0, etc.
    process_adc_data(adc_buffer);
}
```

---

## FreeRTOS

Système d'exploitation temps réel pour microcontrôleurs.

### Tâches

```c
// Créer des tâches
void vTaskLED(void *pvParameters) {
    while(1) {
        HAL_GPIO_TogglePin(GPIOA, GPIO_PIN_5);
        vTaskDelay(pdMS_TO_TICKS(500));  // 500 ms
    }
}

void vTaskSensor(void *pvParameters) {
    while(1) {
        float temp = read_temperature();
        xQueueSend(xTempQueue, &temp, portMAX_DELAY);
        vTaskDelay(pdMS_TO_TICKS(100));
    }
}

// Dans main()
xTaskCreate(vTaskLED, "LED", 128, NULL, 1, NULL);          // Priorité 1
xTaskCreate(vTaskSensor, "Sensor", 256, NULL, 2, NULL);    // Priorité 2
vTaskStartScheduler();
```

### Synchronisation — Queue, Mutex, Sémaphore

```c
// Queue : passage de données entre tâches
QueueHandle_t xTempQueue = xQueueCreate(10, sizeof(float));

// Producteur
float temp = 22.5f;
xQueueSend(xTempQueue, &temp, pdMS_TO_TICKS(100));  // Timeout 100ms

// Consommateur
float received;
if (xQueueReceive(xTempQueue, &received, portMAX_DELAY) == pdTRUE) {
    printf("Temp: %.1f°C\n", received);
}

// Mutex — protection d'une ressource partagée
MutexHandle_t xUartMutex = xSemaphoreCreateMutex();

void safe_print(const char *msg) {
    xSemaphoreTake(xUartMutex, portMAX_DELAY);
    HAL_UART_Transmit(&huart2, (uint8_t*)msg, strlen(msg), 100);
    xSemaphoreGive(xUartMutex);
}
```

---

## Gestion de l'énergie

```c
// Modes de veille STM32
// SLEEP — CPU arrêté, périphériques actifs
HAL_PWR_EnterSLEEPMode(PWR_MAINREGULATOR_ON, PWR_SLEEPENTRY_WFI);

// STOP — CPU + la plupart des horloges arrêtés (réveil par EXTI)
HAL_PWR_EnterSTOPMode(PWR_LOWPOWERREGULATOR_ON, PWR_STOPENTRY_WFI);

// STANDBY — état le plus bas (RAM perdue, réveil par NRST ou WakeUp pin)
HAL_PWR_EnterSTANDBYMode();

// Reconfigurer les horloges après STOP
SystemClock_Config();
```

| Mode | Conso. typique (STM32L4) | Réveil par |
|------|--------------------------|-----------|
| Run | 100 µA/MHz | — |
| Sleep | 30 µA/MHz | IRQ |
| Stop 1 | 4 µA | RTC, EXTI |
| Standby | 1 µA | NRST, WakeUp, RTC |
| Shutdown | 50 nA | NRST, WakeUp |

---

## Résumé

| Concept | Points clés |
|---------|------------|
| Architecture | Cortex-M : niveaux de privilège, NVIC, bus AHB/APB |
| GPIO | Mode push-pull / open-drain, pull-up/down |
| Interruptions | ISR courte, flag + traitement en boucle principale |
| Communication | UART (asynchrone), I²C (multi-esclaves), SPI (rapide), CAN (automotive) |
| DMA | Libère le CPU pour les transferts répétitifs |
| FreeRTOS | Tâches + queues + mutex = code modulaire et déterministe |
| Énergie | Choisir le mode de veille selon les contraintes de réveil |
