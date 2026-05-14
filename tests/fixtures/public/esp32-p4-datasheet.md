<!-- PDF_PAGE_BEGIN 1 -->
# ESP32-P4 Series Datasheet

**Pre-release v0.6**

MCU with one RISC-V 32-bit dual-core high-performance microprocessor and one single-core low-power microprocessor

Powerful image and voice processing capability

16 MB or 32 MB PSRAM in the chip's package

55 GPIOs, rich set of peripherals

QFN104 (10×10 mm) Package

Including:

- ESP32-P4NRW16X
- ESP32-P4NRW32X

www.espressif.com
<!-- PDF_PAGE_END 1 -->

<!-- PDF_PAGE_BEGIN 2 -->
## Product Overview

ESP32-P4 is a high-performance MCU that supports large internal memory and has powerful image and voice processing capabilities. The MCU consists of a High Performance (HP) system and a Low Power (LP) system. The HP system contains a RISC-V dual-core CPU and rich peripherals, while the LP system contains a low-power RISC-V single-core CPU and various peripherals optimized for low-power applications.

The functional block diagram of the SoC is shown below. For more information on power consumption, see Section 4.1.4.6 *Low-Power Management*.

<!-- IMAGE_BEGIN -->
<!-- IMAGE_RECT 0.05,0.30,0.95,0.85 -->
**ESP32-P4 Functional Block Diagram**

![ESP32-P4 Functional Block Diagram](esp32-p4-datasheet.images/img_p002_01.png)
<!-- IMAGE_AI_GENERATED_DESCRIPTION_BEGIN -->
> Block diagram titled "ESP32-P4 — Espressif's High Performance MCU". The diagram is divided into several grouped sections:
>
> **HP Core System**: Contains "RISC-V 32-bit Dual-core Microprocessor 400 MHz", "HPSPM", "L2MEM", "2-level Cache", "JTAG", "L2ROM".
>
> **LP Core System**: Contains "RISC-V 32-bit Single-core Microprocessor 40 MHz", "LPSPM", "LPROM", "JTAG".
>
> **Low Power System**: Contains "Power Management Unit", "BAT Power Supply".
>
> **LP Peripherals**: Contains "LP SPI", "LP I2C", "LP I2S", "LP Mailbox", "LP GPIO", "LP UART", "LP DIG ADC Controller", "eFuse Controller", "GP & WDT & LP Timers & Super WDT", "Touch Sensor", "Temperature Sensor".
>
> **HP Peripherals**: Contains "SPI", "I2C", "I2S with PDM", "DIG ADC Controller", "ISP", "PPA", "GPIO", "UART", "Bit Scrambler", "SD/MMC Host", "H264 Encoder", "2D-DMA", "TWAI®", "Pulse Counter", "RMT", "USB Serial JTAG", "JPEG Codec", "I3C Master & Slave", "GDMA", "DW-GDMA", "SOC ETM", "USB 2.0 OTG High-speed", "Camera Interface", "MIPI CSI", "LED PWM", "MCPWM", "Parallel IO", "USB 2.0 OTG Full-speed", "LCD Interface", "MIPI DSI", "GP Timers", "System Timer", "WDT", "Ethernet", "Brownout", "Debug Probe".
>
> **Security**: Contains "SHA", "RSA_DS", "ECC", "HMAC", "TEE", "TRNG", "ECDSA_DS", "AES", "Digital Signature", "APM", "XTS_AES", "PMP and PMA", "Secure Boot", "HUK and Key Manager", "4096-bit OTP".
>
> A legend at the bottom labeled "Modules having power in specific power modes:" shows four colored indicators: Active/Light-sleep (dark blue), Option 0 in Light-sleep, Option 1 in Light-sleep, Optional in Deep-sleep, and All modes. Many blocks are marked with a small gear icon (⚙) indicating optional power configurability.
<!-- IMAGE_AI_GENERATED_DESCRIPTION_END -->
<!-- IMAGE_END -->
<!-- PDF_PAGE_END 2 -->

<!-- PDF_PAGE_BEGIN 3 -->
## Features

### CPU and Memory

- 32-bit RISC-V dual-core processor up to 400 MHz for HP system
- 32-bit RISC-V single-core processor up to 40 MHz for LP system
- CoreMark® Score (dual-core):
  – 6.92 CoreMark/MHz
- 128 KB HP ROM
- 16 KB LP ROM
- 768 KB HP L2MEM
- 32 KB LP SRAM
- 8 KB system SPM (Scratchpad Memory)
- Multiple high-speed external memory interfaces
- Two-level high-speed cache

### System DMA

- GDMA Controller
- VDMA Controller
- 2D-DMA Controller

### Advanced Peripheral Interfaces and Sensors

- 55 programmable GPIOs
  – Five strapping GPIOs
- Image processing subsystem:
  – JPEG Codec
  – Image Signal Processor (ISP)
  – Pixel-Processing Accelerator (PPA)
  – LCD and Camera controller
  – H264 encoder
  – MIPI CSI
  – MIPI DSI
- Digital interfaces and peripherals:
  – Five UARTs
  – LP UART
<!-- PDF_PAGE_END 3 -->

<!-- PDF_PAGE_BEGIN 4 -->
– Four SPIs

– LP SPI

– Two I2Cs

– LP I2C

– Analog I2C

– I3C

– Three I2Ss

– LP I2S

– Pulse Count Controller (PCNT)

– USB 2.0 High-Speed OTG

– USB 2.0 Full-Speed OTG

– USB Serial/JTAG Controller

– Ethernet Media Access Controller (EMAC)

– Two-Wire Automotive Interface (TWAI)

– SD/MMC Host Controller (SDHOST)

– LED PWM Controller (LEDC)

– Motor Control PWM (MCPWM)

– Remote Control Peripheral (RMT)

– Parallel IO Controller (PARLIO)

– BitScrambler

– Voice Activity Detection (VAD)

- Analog peripherals and sensors:
  – Touch sensor

  – Temperature sensor

  – Two ADC Controllers

  – Analog voltage comparator

- Timers:
  – Two 52-bit HP system timers

  – Four 54-bit HP general-purpose timers

  – Two 32-bit HP watchdog timers (MWDT)

  – 32-bit LP watchdog timer (RWDT)

  – Analog super watchdog timer (SWD)

  – 48-bit LP general-purpose timer (RTC Timer)
<!-- PDF_PAGE_END 4 -->

<!-- PDF_PAGE_BEGIN 5 -->
### Security

- Secure boot
- One-time writing security ensured by eFuse OTP
- Cryptography/Security Components:
  – AES Accelerator

  – ECC Accelerator

  – HMAC Accelerator

  – RSA Accelerator

  – SHA Accelerator

  – RSA Digital Signature Peripheral (RSA_DS)

  – ECDSA Digital Signature Peripheral (ECDSA_DS)

  – External Memory Encryption and Decryption (XTS_AES)

  – True Random Number Generator (TRNG)

- Key Manager
  – HUK generation based on SRAM PUF

  – Secure key management

- Permission Control (PMS)

## Applications

With low power consumption, ESP32-P4 is an ideal choice for IoT devices in the following areas:

- Smart Home
- Industrial Automation
- Health Care
- Consumer Electronics
- Smart Agriculture
- Retail Self-Service Terminals (POS, Vending Machines)
- Service Robot
- Multimedia Player
- Cameras for Video Streaming
- High-Speed USB Host and Device
- Smart Voice Interaction Terminal
- Edge Vision AI Processor
- HMI Control Panel
<!-- PDF_PAGE_END 5 -->

<!-- PDF_PAGE_BEGIN 6 -->
<!-- PDF_PAGE_SKIP -->
<!-- PDF_PAGE_END 6 -->

<!-- PDF_PAGE_BEGIN 7 -->
<!-- PDF_PAGE_SKIP -->
<!-- PDF_PAGE_END 7 -->

<!-- PDF_PAGE_BEGIN 8 -->
<!-- PDF_PAGE_SKIP -->
<!-- PDF_PAGE_END 8 -->

<!-- PDF_PAGE_BEGIN 9 -->
<!-- PDF_PAGE_SKIP -->
<!-- PDF_PAGE_END 9 -->

<!-- PDF_PAGE_BEGIN 10 -->
<!-- PDF_PAGE_SKIP -->
<!-- PDF_PAGE_END 10 -->

<!-- PDF_PAGE_BEGIN 11 -->
# 1 ESP32-P4 Series Comparison

## 1.1 Nomenclature

<!-- IMAGE_BEGIN -->
<!-- IMAGE_RECT 0.15,0.10,0.90,0.42 -->
**Figure 1-1. ESP32-P4 Series Nomenclature**

![Figure 1-1. ESP32-P4 Series Nomenclature](esp32-p4-datasheet.images/img_p011_01.png)
<!-- IMAGE_AI_GENERATED_DESCRIPTION_BEGIN -->
> Diagram showing the part-number nomenclature "ESP32-P4 N R W x" arranged as a sequence of labeled boxes. Arrows from each character point to its meaning:
> - "ESP32-P4" (red box): Chip series
> - "N": PSRAM temperature — N: Normal temperature
> - "R": PSRAM
> - "W": 16-line PSRAM, 1.8 V
> - "x": PSRAM size (MB)
<!-- IMAGE_AI_GENERATED_DESCRIPTION_END -->
<!-- IMAGE_END -->

## 1.2 Comparison

**Table 1-1. ESP32-P4 Series Comparison**

<table>
  <thead>
    <tr>
      <th>Part Number<sup>1</sup></th>
      <th>In-Package PSRAM</th>
      <th>Ambient Temp.<sup>2</sup> (°C)</th>
      <th>VDD_PSRAM_0/1 Voltage <sup>3</sup></th>
      <th>Chip Revision</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ESP32-P4NRW16X</td>
      <td>16 MB (OPI/HPI)<sup>4</sup></td>
      <td>–40 ∼ 85</td>
      <td>1.8 V</td>
      <td>v3.x</td>
    </tr>
    <tr>
      <td>ESP32-P4NRW32X</td>
      <td>32 MB (OPI/HPI)<sup>4</sup></td>
      <td>–40 ∼ 85</td>
      <td>1.8 V</td>
      <td>v3.x</td>
    </tr>
  </tbody>
</table>

<sup>1</sup> For details on chip marking and packing, see Section 6 *Packaging*.

<sup>2</sup> Ambient temperature specifies the recommended temperature range of the environment immediately outside an Espressif chip.

<sup>3</sup> For more information on VDD_PSRAM_0/1, see Section 2.6 *Power Supply*.

<sup>4</sup> OPI of PSRAM supports transferring eight-bit commands, addresses, and data; HPI supports transferring eight-bit commands and addresses as well as 16-bit data. For details about SPI modes, see Section 2.7 *Pin Mapping Between Chip and Flash*.

## 1.3 Chip Revision

As shown in Table 1-1 *Comparison*, ESP32-P4 now has multiple chip revisions available on the market using the same part number.

For chip revision identification, ESP-IDF release that supports a specific chip revision, and errors fixed in each chip revision, please refer to *ESP32-P4 Series SoC Errata*.
<!-- PDF_PAGE_END 11 -->

<!-- PDF_PAGE_BEGIN 12 -->
For differences between chip revision v3.x and previous ESP32-P4 chip revisions, please refer to *ESP32-P4 Chip Revision v3.x User Guide*.
<!-- PDF_PAGE_END 12 -->

<!-- PDF_PAGE_BEGIN 13 -->
# 2 Pins

## 2.1 Pin Layout

<!-- IMAGE_BEGIN -->
<!-- IMAGE_RECT 0.05,0.10,0.95,0.85 -->
**Figure 2-1. ESP32-P4 Pin Layout (Top View)**

![Figure 2-1. ESP32-P4 Pin Layout (Top View)](esp32-p4-datasheet.images/img_p013_01.png)
<!-- IMAGE_AI_GENERATED_DESCRIPTION_BEGIN -->
> Top-view pinout diagram of the ESP32-P4 QFN104 package. The chip is shown as a square with the Espressif logo and "ESP32-P4" label in the center. Pins are numbered 1–105 around the perimeter (with pin 105 = GND, the central exposed pad). A small dot near pin 1 marks the pin-1 indicator.
>
> **Left side (pins 1–26, top to bottom):** GPIO1, GPIO2, GPIO3, GPIO4, GPIO5, GPIO6, GPIO7, GPIO8, VDD_LP, GPIO9, GPIO10, GPIO11, GPIO12, GPIO13, GPIO14, GPIO15, GPIO16, GPIO17, GPIO18, GPIO19, VDD_IO_0, GPIO20, GPIO21, GPIO22, GPIO23, VDD_HP_0.
>
> **Bottom side (pins 27–52, left to right):** FLASH_CS, FLASH_Q, FLASH_WP, VDD_FLASHIO, FLASH_HOLD, FLASH_CK, FLASH_D, DSI_REXT, DSI_DATAP1, DSI_DATAN1, DSI_CLKN, DSI_CLKP, DSI_DATAP0, DSI_DATAN0, VDD_MIPI_DPHY, CSI_DATAN0, CSI_DATAP0, CSI_CLKP, CSI_CLKN, CSI_DATAN1, CSI_DATAP1, CSI_REXT, USB_DM, USB_DP, VDD_USBPHY, GPIO24.
>
> **Right side (pins 53–78, bottom to top):** GPIO25, VDD_HP_1, GPIO26, GPIO27, GPIO28, GPIO29, VDD_PSRAM_0, GPIO30, GPIO31, VDD_IO_4, GPIO32, GPIO33, GPIO34, GPIO35, VDD_PSRAM_1, GPIO36, GPIO37, GPIO38, VDDO_FLASH, VDDO_PSRAM, VDDO_3, VDDO_4, VDD_LDO, VDD_HP_2, VDD_DCDCC, FB_DCDC.
>
> **Top side (pins 79–104, right to left):** EN_DCDC, GPIO39, GPIO40, GPIO41, GPIO42, GPIO43, VDD_IO_5, GPIO44, GPIO45, GPIO46, GPIO47, GPIO48, VDD_HP_3, GPIO49, GPIO50, GPIO51, GPIO52, VDD_IO_6, GPIO53, GPIO54, XTAL_N, XTAL_P, VDD_ANA, VDD_BAT, CHIP_PU, GPIO0.
>
> The center exposed pad is labeled "105 GND".
<!-- IMAGE_AI_GENERATED_DESCRIPTION_END -->
<!-- IMAGE_END -->
<!-- PDF_PAGE_END 13 -->

<!-- PDF_PAGE_BEGIN 14 -->
## 2.2 Pin Overview

The ESP32-P4 chip integrates multiple peripherals that require communication with the outside world. To keep the chip package size reasonably small, the number of available pins has to be limited. So the only way to route all the incoming and outgoing signals is through pin multiplexing. Pin muxing is controlled via software programmable registers (see *ESP32-P4 Technical Reference Manual* > Chapter *GPIO Matrix and IO MUX*). In addition, ESP32-P4 has a number of pins that are dedicated to certain peripherals, such as MIPI DSI and CSI, and cannot be used for general-purpose IO.

All in all, the ESP32-P4 chip has the following types of pins:

- **IO pins** with the following predefined sets of functions to choose from:
  – **Each** IO pin has predefined **IO MUX functions** – see Table 2-3 *IO MUX Functions*
  – **Some** IO pins have predefined **LP IO MUX functions** – see Table 2-5 *LP IO MUX Functions*
  – **Some** IO pins have predefined **analog functions** – see Table 2-7 *Analog Functions*

  *Predefined functions* means that each IO pin has a set of direct connections to certain signals from on-chip components. During run-time, the user can configure which component signal from a predefined set to connect to a certain pin at a certain time via memory mapped registers.

- **Dedicated interface pins** can only be used by certain peripherals, such as flash, MIPI DSI, and MIPI CSI – see Table 2-9 *Dedicated Interface Pins*
- **Analog pins** that have exclusively-dedicated **analog functions** – see Table 2-10 *Analog Pins*
- **Power pins** that supply power to the chip components and non-power pins – see Table 2-11 *Power Pins*

Table 2-1 *Pin Overview* gives an overview of all the pins. For more information, see the respective sections for each pin type below, or Appendix A – ESP32-P4 Consolidated Pin Overview.

**Table 2-1. Pin Overview**

<table>
  <thead>
    <tr>
      <th rowspan="2">Pin No.</th>
      <th rowspan="2">Pin Name</th>
      <th rowspan="2">Pin Type</th>
      <th rowspan="2">Pin Providing Power <sup>2, 3</sup></th>
      <th colspan="2">Pin Settings <sup>4</sup></th>
      <th colspan="3">Pin Function Sets <sup>1</sup></th>
    </tr>
    <tr>
      <th>At Reset</th>
      <th>After Reset</th>
      <th>IO MUX</th>
      <th>LP IO MUX</th>
      <th>Analog</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>GPIO1</td>
      <td>IO</td>
      <td>VDD_LP / VDD_BAT</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>LP IO MUX</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>2</td>
      <td>GPIO2</td>
      <td>IO</td>
      <td>VDD_LP / VDD_BAT</td>
      <td>–</td>
      <td>IE, WPU<sup>5</sup></td>
      <td><strong>IO MUX</strong></td>
      <td>LP IO MUX</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>3</td>
      <td>GPIO3</td>
      <td>IO</td>
      <td>VDD_LP / VDD_BAT</td>
      <td>–</td>
      <td>IE</td>
      <td><strong>IO MUX</strong></td>
      <td>LP IO MUX</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>4</td>
      <td>GPIO4</td>
      <td>IO</td>
      <td>VDD_LP</td>
      <td>–</td>
      <td>IE</td>
      <td><strong>IO MUX</strong></td>
      <td>LP IO MUX</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>5</td>
      <td>GPIO5</td>
      <td>IO</td>
      <td>VDD_LP</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>LP IO MUX</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>6</td>
      <td>GPIO6</td>
      <td>IO</td>
      <td>VDD_LP</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>LP IO MUX</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>7</td>
      <td>GPIO7</td>
      <td>IO</td>
      <td>VDD_LP</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>LP IO MUX</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>8</td>
      <td>GPIO8</td>
      <td>IO</td>
      <td>VDD_LP</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>LP IO MUX</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>9</td>
      <td>VDD_LP</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>10</td>
      <td>GPIO9</td>
      <td>IO</td>
      <td>VDD_LP</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>LP IO MUX</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>11</td>
      <td>GPIO10</td>
      <td>IO</td>
      <td>VDD_LP</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>LP IO MUX</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>12</td>
      <td>GPIO11</td>
      <td>IO</td>
      <td>VDD_LP</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>LP IO MUX</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>13</td>
      <td>GPIO12</td>
      <td>IO</td>
      <td>VDD_LP</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>LP IO MUX</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>14</td>
      <td>GPIO13</td>
      <td>IO</td>
      <td>VDD_LP</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>LP IO MUX</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>15</td>
      <td>GPIO14</td>
      <td>IO</td>
      <td>VDD_LP</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>LP IO MUX</td>
      <td>Analog</td>
    </tr>
    <!-- PDF_PAGE_END 14 -->
    <!-- PDF_PAGE_BEGIN 15 -->
    <tr>
      <td>16</td>
      <td>GPIO15</td>
      <td>IO</td>
      <td>VDD_LP</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>LP IO MUX</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>17</td>
      <td>GPIO16</td>
      <td>IO</td>
      <td>VDD_IO_0</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>18</td>
      <td>GPIO17</td>
      <td>IO</td>
      <td>VDD_IO_0</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>19</td>
      <td>GPIO18</td>
      <td>IO</td>
      <td>VDD_IO_0</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>20</td>
      <td>GPIO19</td>
      <td>IO</td>
      <td>VDD_IO_0</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>21</td>
      <td>VDD_IO_0</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>22</td>
      <td>GPIO20</td>
      <td>IO</td>
      <td>VDD_IO_0</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>23</td>
      <td>GPIO21</td>
      <td>IO</td>
      <td>VDD_IO_0</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>24</td>
      <td>GPIO22</td>
      <td>IO</td>
      <td>VDD_IO_0</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>25</td>
      <td>GPIO23</td>
      <td>IO</td>
      <td>VDD_IO_0</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>26</td>
      <td>VDD_HP_0</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>27</td>
      <td>FLASH_CS</td>
      <td>Dedicated Output</td>
      <td>VDD_FLASHIO</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>28</td>
      <td>FLASH_Q</td>
      <td>Dedicated IO</td>
      <td>VDD_FLASHIO</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>29</td>
      <td>FLASH_WP</td>
      <td>Dedicated IO</td>
      <td>VDD_FLASHIO</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>30</td>
      <td>VDD_FLASHIO</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>31</td>
      <td>FLASH_HOLD</td>
      <td>Dedicated IO</td>
      <td>VDD_FLASHIO</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>32</td>
      <td>FLASH_CK</td>
      <td>Dedicated Output</td>
      <td>VDD_FLASHIO</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>33</td>
      <td>FLASH_D</td>
      <td>Dedicated IO</td>
      <td>VDD_FLASHIO</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>34</td>
      <td>DSI_REXT</td>
      <td>Dedicated IO</td>
      <td>VDD_MIPI_DPHY</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>35</td>
      <td>DSI_DATAP1</td>
      <td>Dedicated IO</td>
      <td>VDD_MIPI_DPHY</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>36</td>
      <td>DSI_DATAN1</td>
      <td>Dedicated IO</td>
      <td>VDD_MIPI_DPHY</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>37</td>
      <td>DSI_CLKN</td>
      <td>Dedicated IO</td>
      <td>VDD_MIPI_DPHY</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>38</td>
      <td>DSI_CLKP</td>
      <td>Dedicated IO</td>
      <td>VDD_MIPI_DPHY</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>39</td>
      <td>DSI_DATAP0</td>
      <td>Dedicated IO</td>
      <td>VDD_MIPI_DPHY</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>40</td>
      <td>DSI_DATAN0</td>
      <td>Dedicated IO</td>
      <td>VDD_MIPI_DPHY</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>41</td>
      <td>VDD_MIPI_DPHY</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>42</td>
      <td>CSI_DATAN0</td>
      <td>Dedicated IO</td>
      <td>VDD_MIPI_DPHY</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>43</td>
      <td>CSI_DATAP0</td>
      <td>Dedicated IO</td>
      <td>VDD_MIPI_DPHY</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>44</td>
      <td>CSI_CLKP</td>
      <td>Dedicated IO</td>
      <td>VDD_MIPI_DPHY</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>45</td>
      <td>CSI_CLKN</td>
      <td>Dedicated IO</td>
      <td>VDD_MIPI_DPHY</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>46</td>
      <td>CSI_DATAN1</td>
      <td>Dedicated IO</td>
      <td>VDD_MIPI_DPHY</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>47</td>
      <td>CSI_DATAP1</td>
      <td>Dedicated IO</td>
      <td>VDD_MIPI_DPHY</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>48</td>
      <td>CSI_REXT</td>
      <td>Dedicated IO</td>
      <td>VDD_MIPI_DPHY</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>49</td>
      <td>USB_DM</td>
      <td>Dedicated IO</td>
      <td>VDD_USBPHY</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>50</td>
      <td>USB_DP</td>
      <td>Dedicated IO</td>
      <td>VDD_USBPHY</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>51</td>
      <td>VDD_USBPHY</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>52</td>
      <td>GPIO24</td>
      <td>IO</td>
      <td>VDD_IO_4</td>
      <td>–</td>
      <td>–</td>
      <td>IO MUX</td>
      <td>–</td>
      <td><strong>Analog</strong></td>
    </tr>
    <tr>
      <td>53</td>
      <td>GPIO25</td>
      <td>IO</td>
      <td>VDD_IO_4</td>
      <td>–</td>
      <td>USB_PU</td>
      <td>IO MUX</td>
      <td>–</td>
      <td><strong>Analog</strong></td>
    </tr>
    <tr>
      <td>54</td>
      <td>VDD_HP_1</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>55</td>
      <td>GPIO26</td>
      <td>IO</td>
      <td>VDD_IO_4</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>56</td>
      <td>GPIO27</td>
      <td>IO</td>
      <td>VDD_IO_4</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>57</td>
      <td>GPIO28</td>
      <td>IO</td>
      <td>VDD_IO_4</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>58</td>
      <td>GPIO29</td>
      <td>IO</td>
      <td>VDD_IO_4</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>59</td>
      <td>VDD_PSRAM_0</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>60</td>
      <td>GPIO30</td>
      <td>IO</td>
      <td>VDD_IO_4</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>–</td>
    </tr>
    <!-- PDF_PAGE_END 15 -->
    <!-- PDF_PAGE_BEGIN 16 -->
    <tr>
      <td>61</td>
      <td>GPIO31</td>
      <td>IO</td>
      <td>VDD_IO_4</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>62</td>
      <td>VDD_IO_4</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>63</td>
      <td>GPIO32</td>
      <td>IO</td>
      <td>VDD_IO_4</td>
      <td>IE</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>64</td>
      <td>GPIO33</td>
      <td>IO</td>
      <td>VDD_IO_4</td>
      <td>IE</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>65</td>
      <td>GPIO34</td>
      <td>IO</td>
      <td>VDD_IO_4</td>
      <td>IE</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>66</td>
      <td>GPIO35</td>
      <td>IO</td>
      <td>VDD_IO_4</td>
      <td>IE, WPU</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>67</td>
      <td>VDD_PSRAM_1</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>68</td>
      <td>GPIO36</td>
      <td>IO</td>
      <td>VDD_IO_4</td>
      <td>IE</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>69</td>
      <td>GPIO37</td>
      <td>IO</td>
      <td>VDD_IO_4</td>
      <td>IE</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>70</td>
      <td>GPIO38</td>
      <td>IO</td>
      <td>VDD_IO_4</td>
      <td>IE</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>71</td>
      <td>VDDO_FLASH</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>72</td>
      <td>VDDO_PSRAM</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>73</td>
      <td>VDDO_3</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>74</td>
      <td>VDDO_4</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>75</td>
      <td>VDD_LDO</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>76</td>
      <td>VDD_HP_2</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>77</td>
      <td>VDD_DCDCC</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>78</td>
      <td>FB_DCDC</td>
      <td>Analog</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>79</td>
      <td>EN_DCDC</td>
      <td>Analog</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>80</td>
      <td>GPIO39</td>
      <td>IO</td>
      <td>VDD_IO_5</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>81</td>
      <td>GPIO40</td>
      <td>IO</td>
      <td>VDD_IO_5</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>82</td>
      <td>GPIO41</td>
      <td>IO</td>
      <td>VDD_IO_5</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>83</td>
      <td>GPIO42</td>
      <td>IO</td>
      <td>VDD_IO_5</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>84</td>
      <td>GPIO43</td>
      <td>IO</td>
      <td>VDD_IO_5</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>85</td>
      <td>VDD_IO_5</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>86</td>
      <td>GPIO44</td>
      <td>IO</td>
      <td>VDD_IO_5</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>87</td>
      <td>GPIO45</td>
      <td>IO</td>
      <td>VDD_IO_5</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>88</td>
      <td>GPIO46</td>
      <td>IO</td>
      <td>VDD_IO_5</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>89</td>
      <td>GPIO47</td>
      <td>IO</td>
      <td>VDD_IO_5</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>90</td>
      <td>GPIO48</td>
      <td>IO</td>
      <td>VDD_IO_5</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>91</td>
      <td>VDD_HP_3</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>92</td>
      <td>GPIO49</td>
      <td>IO</td>
      <td>VDD_IO_6</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>93</td>
      <td>GPIO50</td>
      <td>IO</td>
      <td>VDD_IO_6</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>94</td>
      <td>GPIO51</td>
      <td>IO</td>
      <td>VDD_IO_6</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>95</td>
      <td>GPIO52</td>
      <td>IO</td>
      <td>VDD_IO_6</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>96</td>
      <td>VDD_IO_6</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>97</td>
      <td>GPIO53</td>
      <td>IO</td>
      <td>VDD_IO_6</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>98</td>
      <td>GPIO54</td>
      <td>IO</td>
      <td>VDD_IO_6</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>–</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>99</td>
      <td>XTAL_N</td>
      <td>Analog</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>100</td>
      <td>XTAL_P</td>
      <td>Analog</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>101</td>
      <td>VDD_ANA</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>102</td>
      <td>VDD_BAT</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>103</td>
      <td>CHIP_PU</td>
      <td>Analog</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>104</td>
      <td>GPIO0</td>
      <td>IO</td>
      <td>VDD_LP / VDD_BAT</td>
      <td>–</td>
      <td>–</td>
      <td><strong>IO MUX</strong></td>
      <td>LP IO MUX</td>
      <td>Analog</td>
    </tr>
    <tr>
      <td>105</td>
      <td>GND</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
  </tbody>
</table>

1. **Bold** marks the pin function set in which a pin has its default function in the default boot mode. See Section 3.1 *Chip Boot Mode*
<!-- PDF_PAGE_END 16 -->

<!-- PDF_PAGE_BEGIN 17 -->
*Control*.

2. In column **Pin Providing Power**, regarding pins powered by VDD_LP / VDD_BAT:
   - Pin Providing Power (either VDD_LP or VDD_BAT) can be configured via a register .

3. Default drive strength for IO pins is 20 mA except for GPIO24 and GPIO25 which have default drive strength of 40 mA.

4. Column **Pin Settings** shows predefined settings at reset and after reset with the following abbreviations:
   - IE – input enabled
   - WPU – internal weak pull-up resistor enabled
   - USB_PU – USB pull-up resistor enabled
     – By default, the USB function is enabled for USB pins (i.e., GPIO24/26 and GPIO25/27), and the pin pull-up is decided by the USB pull-up. The USB pull-up is controlled by USB_SERIAL_JTAG_DP/DM_PULLUP and the pull-up resistor value is controlled by USB_SERIAL_JTAG_PULLUP_VALUE.
     – When the USB function is disabled, USB pins are used as regular GPIOs and the pin's internal weak pull-up and pull-down resistors are disabled by default (configurable by IO_MUX_GPIOx_FUN_WPU/WPD).

5. Depends on the value of EFUSE_DIS_PAD_JTAG
   - 0 (default), input enabled, pull-up resistor enabled (IE = 1, WPU = 1)
   - 1, input disabled, in high impedance state (IE = 0)
<!-- PDF_PAGE_END 17 -->

<!-- PDF_PAGE_BEGIN 18 -->
## 2.3 IO Pins

### 2.3.1 IO MUX Functions

The IO MUX allows multiple input/output signals to be connected to a single input/output pin. Each IO pin of ESP32-P4 can be connected to one of the four signals (IO MUX functions, i.e., F0–F3), as listed in Table 2-3 *IO MUX Functions*.

Among the four sets of signals:

- Some are routed via the GPIO Matrix (**GPIO0, GPIO1, etc.**), which incorporates internal signal routing circuitry for mapping signals programmatically. It gives the pin access to almost any peripheral signals. However, the flexibility of programmatic mapping comes at a cost as it might affect the latency of routed signals.
- Some are directly routed from certain peripherals (**U0TXD, MTCK, etc.**), including UART0, JTAG, and SPI2 - see Table 2-2 *IO MUX Functions*.

**Table 2-2. Peripheral Signals Routed via IO MUX**

<table>
  <thead>
    <tr>
      <th>Pin Function</th>
      <th>Signal</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>MTCK</td>
      <td>Test clock</td>
      <td rowspan="4">JTAG interface for debugging</td>
    </tr>
    <tr>
      <td>MTDO</td>
      <td>Test data out</td>
    </tr>
    <tr>
      <td>MTDI</td>
      <td>Test data in</td>
    </tr>
    <tr>
      <td>MTMS</td>
      <td>Test mode select</td>
    </tr>
    <tr>
      <td>SPI2_HOLD_PAD</td>
      <td>Hold</td>
      <td rowspan="6">3.3 V SPI2 interface which can operate in master and slave modes. The interface supports 1-line, 2-line, 4-line, and 8-line modes (the 8-line mode is supported only in the master mode).</td>
    </tr>
    <tr>
      <td>SPI2_CS_PAD</td>
      <td>Chip select</td>
    </tr>
    <tr>
      <td>SPI2_D_PAD</td>
      <td>Data in</td>
    </tr>
    <tr>
      <td>SPI2_CK_PAD</td>
      <td>Clock</td>
    </tr>
    <tr>
      <td>SPI2_Q_PAD</td>
      <td>Data out</td>
    </tr>
    <tr>
      <td>SPI2_WP_PAD</td>
      <td>Write protect</td>
    </tr>
    <tr>
      <td>SPI2_IO…_PAD</td>
      <td>Data</td>
      <td rowspan="2">The high 4-bit data line interface and the DQS interface for 3.3 V SPI2 interface in 8-line SPI mode</td>
    </tr>
    <tr>
      <td>SPI2_DQS_PAD</td>
      <td>Data strobe/data mask</td>
    </tr>
    <tr>
      <td>UART0_TXD_PAD</td>
      <td>Transmit data</td>
      <td rowspan="2">UART0 Interface</td>
    </tr>
    <tr>
      <td>UART0_RXD_PAD</td>
      <td>Receive data</td>
    </tr>
    <tr>
      <td>REF_50M_CLK_PAD</td>
      <td>50 MHz reference clock output</td>
      <td>Provides 50 MHz clock for internal and external modules</td>
    </tr>
    <tr>
      <td>GMAC_PHY_RXDV_PAD <sup>1</sup></td>
      <td>Receive data valid</td>
      <td rowspan="8">RMII Ethernet PHY interface</td>
    </tr>
    <tr>
      <td>GMAC_PHY_RXD…_PAD</td>
      <td>Receive data line 0/1</td>
    </tr>
    <tr>
      <td>GMAC_PHY_RXER_PAD</td>
      <td>Receive error</td>
    </tr>
    <tr>
      <td>GMAC_PHY_TXDV_PAD</td>
      <td>Transmit data valid</td>
    </tr>
    <tr>
      <td>GMAC_PHY_TXD…_PAD</td>
      <td>Transmit data line 0/1</td>
    </tr>
    <tr>
      <td>GMAC_PHY_TXER_PAD</td>
      <td>Transmit error</td>
    </tr>
    <tr>
      <td>GMAC_PHY_TXEN_PAD</td>
      <td>Transmit enable</td>
    </tr>
    <tr>
      <td>GMAC_RMII_CLK_PAD</td>
      <td>RMII clock</td>
    </tr>
    <tr>
      <td>SD1_CDATA…_PAD</td>
      <td>Card data line 0–7 of SD1</td>
      <td rowspan="3">SDIO3.0 interface</td>
    </tr>
    <tr>
      <td>SD1_CCLK_PAD</td>
      <td>Card clock of SD1</td>
    </tr>
    <tr>
      <td>SD1_CCMD_PAD</td>
      <td>Card command of SD1</td>
    </tr>
  </tbody>
</table>

<sup>1</sup> The PAD layer does not distinguish between MII and RMII interfaces. This signal is used as RX_DV in MII mode and as CRS_DV in RMII mode.
<!-- PDF_PAGE_END 18 -->

<!-- PDF_PAGE_BEGIN 19 -->
Table 2-3 *IO MUX Functions* shows the IO MUX functions of IO pins.
<!-- PDF_PAGE_END 19 -->

<!-- PDF_PAGE_BEGIN 20 -->
**Table 2-3. IO MUX Pin Functions**

<table>
  <thead>
    <tr>
      <th rowspan="2">Pin No.</th>
      <th rowspan="2">IO MUX / GPIO Name <sup>2</sup></th>
      <th colspan="8">IO MUX Function <sup>1, 2, 3</sup></th>
    </tr>
    <tr>
      <th>F0</th>
      <th>Type <sup>3</sup></th>
      <th>F1</th>
      <th>Type</th>
      <th>F2</th>
      <th>Type</th>
      <th>F3</th>
      <th>Type</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>GPIO1</td>
      <td><strong>GPIO1</strong></td>
      <td>I/O/T</td>
      <td>GPIO1</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>2</td>
      <td>GPIO2</td>
      <td><strong>MTCK</strong></td>
      <td>I1</td>
      <td>GPIO2</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>3</td>
      <td>GPIO3</td>
      <td><strong>MTDI</strong></td>
      <td>I1</td>
      <td>GPIO3</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>4</td>
      <td>GPIO4</td>
      <td><strong>MTMS</strong></td>
      <td>I0</td>
      <td>GPIO4</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>5</td>
      <td>GPIO5</td>
      <td><strong>MTDO</strong></td>
      <td>O/T</td>
      <td>GPIO5</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>6</td>
      <td>GPIO6</td>
      <td><strong>GPIO6</strong></td>
      <td>I/O/T</td>
      <td>GPIO6</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>SPI2_HOLD_PAD</td>
      <td>I1/O/T</td>
    </tr>
    <tr>
      <td>7</td>
      <td>GPIO7</td>
      <td><strong>GPIO7</strong></td>
      <td>I/O/T</td>
      <td>GPIO7</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>SPI2_CS_PAD</td>
      <td>I1/O/T</td>
    </tr>
    <tr>
      <td>8</td>
      <td>GPIO8</td>
      <td><strong>GPIO8</strong></td>
      <td>I/O/T</td>
      <td>GPIO8</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>SPI2_D_PAD</td>
      <td>I1/O/T</td>
    </tr>
    <tr>
      <td>10</td>
      <td>GPIO9</td>
      <td><strong>GPIO9</strong></td>
      <td>I/O/T</td>
      <td>GPIO9</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>SPI2_CK_PAD</td>
      <td>I1/O/T</td>
    </tr>
    <tr>
      <td>11</td>
      <td>GPIO10</td>
      <td><strong>GPIO10</strong></td>
      <td>I/O/T</td>
      <td>GPIO10</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>SPI2_Q_PAD</td>
      <td>I1/O/T</td>
    </tr>
    <tr>
      <td>12</td>
      <td>GPIO11</td>
      <td><strong>GPIO11</strong></td>
      <td>I/O/T</td>
      <td>GPIO11</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>SPI2_WP_PAD</td>
      <td>I1/O/T</td>
    </tr>
    <tr>
      <td>13</td>
      <td>GPIO12</td>
      <td><strong>GPIO12</strong></td>
      <td>I/O/T</td>
      <td>GPIO12</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>14</td>
      <td>GPIO13</td>
      <td><strong>GPIO13</strong></td>
      <td>I/O/T</td>
      <td>GPIO13</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>15</td>
      <td>GPIO14</td>
      <td><strong>GPIO14</strong></td>
      <td>I/O/T</td>
      <td>GPIO14</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>16</td>
      <td>GPIO15</td>
      <td><strong>GPIO15</strong></td>
      <td>I/O/T</td>
      <td>GPIO15</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>17</td>
      <td>GPIO16</td>
      <td><strong>GPIO16</strong></td>
      <td>I/O/T</td>
      <td>GPIO16</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>18</td>
      <td>GPIO17</td>
      <td><strong>GPIO17</strong></td>
      <td>I/O/T</td>
      <td>GPIO17</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>19</td>
      <td>GPIO18</td>
      <td><strong>GPIO18</strong></td>
      <td>I/O/T</td>
      <td>GPIO18</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>20</td>
      <td>GPIO19</td>
      <td><strong>GPIO19</strong></td>
      <td>I/O/T</td>
      <td>GPIO19</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>22</td>
      <td>GPIO20</td>
      <td><strong>GPIO20</strong></td>
      <td>I/O/T</td>
      <td>GPIO20</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>23</td>
      <td>GPIO21</td>
      <td><strong>GPIO21</strong></td>
      <td>I/O/T</td>
      <td>GPIO21</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>24</td>
      <td>GPIO22</td>
      <td><strong>GPIO22</strong></td>
      <td>I/O/T</td>
      <td>GPIO22</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>25</td>
      <td>GPIO23</td>
      <td><strong>GPIO23</strong></td>
      <td>I/O/T</td>
      <td>GPIO23</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>REF_50M_CLK_PAD</td>
      <td>O</td>
    </tr>
    <tr>
      <td>52</td>
      <td>GPIO24</td>
      <td>GPIO24</td>
      <td>I/O/T</td>
      <td>GPIO24</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <!-- PDF_PAGE_END 20 -->
    <!-- PDF_PAGE_BEGIN 21 -->
    <tr>
      <td>53</td>
      <td>GPIO25</td>
      <td>GPIO25</td>
      <td>I/O/T</td>
      <td>GPIO25</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>55</td>
      <td>GPIO26</td>
      <td><strong>GPIO26</strong></td>
      <td>I/O/T</td>
      <td>GPIO26</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>56</td>
      <td>GPIO27</td>
      <td><strong>GPIO27</strong></td>
      <td>I/O/T</td>
      <td>GPIO27</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>57</td>
      <td>GPIO28</td>
      <td><strong>GPIO28</strong></td>
      <td>I/O/T</td>
      <td>GPIO28</td>
      <td>I/O/T</td>
      <td>SPI2_CS_PAD</td>
      <td>I1/O/T</td>
      <td>GMAC_PHY_RXDV_PAD</td>
      <td>IO</td>
    </tr>
    <tr>
      <td>58</td>
      <td>GPIO29</td>
      <td><strong>GPIO29</strong></td>
      <td>I/O/T</td>
      <td>GPIO29</td>
      <td>I/O/T</td>
      <td>SPI2_D_PAD</td>
      <td>I1/O/T</td>
      <td>GMAC_PHY_RXD0_PAD</td>
      <td>IO</td>
    </tr>
    <tr>
      <td>60</td>
      <td>GPIO30</td>
      <td><strong>GPIO30</strong></td>
      <td>I/O/T</td>
      <td>GPIO30</td>
      <td>I/O/T</td>
      <td>SPI2_CK_PAD</td>
      <td>I1/O/T</td>
      <td>GMAC_PHY_RXD1_PAD</td>
      <td>IO</td>
    </tr>
    <tr>
      <td>61</td>
      <td>GPIO31</td>
      <td><strong>GPIO31</strong></td>
      <td>I/O/T</td>
      <td>GPIO31</td>
      <td>I/O/T</td>
      <td>SPI2_Q_PAD</td>
      <td>I1/O/T</td>
      <td>GMAC_PHY_RXER_PAD</td>
      <td>IO</td>
    </tr>
    <tr>
      <td>63</td>
      <td>GPIO32</td>
      <td><strong>GPIO32</strong></td>
      <td>I/O/T</td>
      <td>GPIO32</td>
      <td>I/O/T</td>
      <td>SPI2_HOLD_PAD</td>
      <td>I1/O/T</td>
      <td>GMAC_RMII_CLK_PAD</td>
      <td>IO</td>
    </tr>
    <tr>
      <td>64</td>
      <td>GPIO33</td>
      <td><strong>GPIO33</strong></td>
      <td>I/O/T</td>
      <td>GPIO33</td>
      <td>I/O/T</td>
      <td>SPI2_WP_PAD</td>
      <td>I1/O/T</td>
      <td>GMAC_PHY_TXEN_PAD</td>
      <td>O</td>
    </tr>
    <tr>
      <td>65</td>
      <td>GPIO34</td>
      <td><strong>GPIO34</strong></td>
      <td>I/O/T</td>
      <td>GPIO34</td>
      <td>I/O/T</td>
      <td>SPI2_IO4_PAD</td>
      <td>I1/O/T</td>
      <td>GMAC_PHY_TXD0_PAD</td>
      <td>O</td>
    </tr>
    <tr>
      <td>66</td>
      <td>GPIO35</td>
      <td><strong>GPIO35</strong></td>
      <td>I/O/T</td>
      <td>GPIO35</td>
      <td>I/O/T</td>
      <td>SPI2_IO5_PAD</td>
      <td>I1/O/T</td>
      <td>GMAC_PHY_TXD1_PAD</td>
      <td>O</td>
    </tr>
    <tr>
      <td>68</td>
      <td>GPIO36</td>
      <td><strong>GPIO36</strong></td>
      <td>I/O/T</td>
      <td>GPIO36</td>
      <td>I/O/T</td>
      <td>SPI2_IO6_PAD</td>
      <td>I1/O/T</td>
      <td>GMAC_PHY_TXER_PAD</td>
      <td>O</td>
    </tr>
    <tr>
      <td>69</td>
      <td>GPIO37</td>
      <td><strong>UART0_TXD_PAD</strong></td>
      <td>O</td>
      <td>GPIO37</td>
      <td>I/O/T</td>
      <td>SPI2_IO7_PAD</td>
      <td>I1/O/T</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>70</td>
      <td>GPIO38</td>
      <td><strong>UART0_RXD_PAD</strong></td>
      <td>I1</td>
      <td>GPIO38</td>
      <td>I/O/T</td>
      <td>SPI2_DQS_PAD</td>
      <td>O/T</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>80</td>
      <td>GPIO39</td>
      <td>SD1_CDATA0_PAD</td>
      <td>I1/O/T</td>
      <td><strong>GPIO39</strong></td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>REF_50M_CLK_PAD</td>
      <td>O</td>
    </tr>
    <tr>
      <td>81</td>
      <td>GPIO40</td>
      <td>SD1_CDATA1_PAD</td>
      <td>I1/O/T</td>
      <td><strong>GPIO40</strong></td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>GMAC_PHY_TXEN_PAD</td>
      <td>O</td>
    </tr>
    <tr>
      <td>82</td>
      <td>GPIO41</td>
      <td>SD1_CDATA2_PAD</td>
      <td>I1/O/T</td>
      <td><strong>GPIO41</strong></td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>GMAC_PHY_TXD0_PAD</td>
      <td>O</td>
    </tr>
    <tr>
      <td>83</td>
      <td>GPIO42</td>
      <td>SD1_CDATA3_PAD</td>
      <td>I1/O/T</td>
      <td><strong>GPIO42</strong></td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>GMAC_PHY_TXD1_PAD</td>
      <td>O</td>
    </tr>
    <tr>
      <td>84</td>
      <td>GPIO43</td>
      <td>SD1_CCLK_PAD</td>
      <td>O</td>
      <td><strong>GPIO43</strong></td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>GMAC_PHY_TXER_PAD</td>
      <td>O</td>
    </tr>
    <tr>
      <td>86</td>
      <td>GPIO44</td>
      <td>SD1_CCMD_PAD</td>
      <td>I1/O/T</td>
      <td><strong>GPIO44</strong></td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>GMAC_RMII_CLK_PAD</td>
      <td>IO</td>
    </tr>
    <tr>
      <td>87</td>
      <td>GPIO45</td>
      <td>SD1_CDATA4_PAD</td>
      <td>I1/O/T</td>
      <td><strong>GPIO45</strong></td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>GMAC_PHY_RXDV_PAD</td>
      <td>IO</td>
    </tr>
    <tr>
      <td>88</td>
      <td>GPIO46</td>
      <td>SD1_CDATA5_PAD</td>
      <td>I1/O/T</td>
      <td><strong>GPIO46</strong></td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>GMAC_PHY_RXD0_PAD</td>
      <td>IO</td>
    </tr>
    <tr>
      <td>89</td>
      <td>GPIO47</td>
      <td>SD1_CDATA6_PAD</td>
      <td>I1/O/T</td>
      <td><strong>GPIO47</strong></td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>GMAC_PHY_RXD1_PAD</td>
      <td>IO</td>
    </tr>
    <tr>
      <td>90</td>
      <td>GPIO48</td>
      <td>SD1_CDATA7_PAD</td>
      <td>I1/O/T</td>
      <td><strong>GPIO48</strong></td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>GMAC_PHY_RXER_PAD</td>
      <td>IO</td>
    </tr>
    <!-- PDF_PAGE_END 21 -->
    <!-- PDF_PAGE_BEGIN 22 -->
    <tr>
      <td>92</td>
      <td>GPIO49</td>
      <td><strong>GPIO49</strong></td>
      <td>I/O/T</td>
      <td>GPIO49</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>GMAC_PHY_TXEN_PAD</td>
      <td>O</td>
    </tr>
    <tr>
      <td>93</td>
      <td>GPIO50</td>
      <td><strong>GPIO50</strong></td>
      <td>I/O/T</td>
      <td>GPIO50</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>GMAC_RMII_CLK_PAD</td>
      <td>IO</td>
    </tr>
    <tr>
      <td>94</td>
      <td>GPIO51</td>
      <td><strong>GPIO51</strong></td>
      <td>I/O/T</td>
      <td>GPIO51</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>GMAC_PHY_RXDV_PAD</td>
      <td>IO</td>
    </tr>
    <tr>
      <td>95</td>
      <td>GPIO52</td>
      <td><strong>GPIO52</strong></td>
      <td>I/O/T</td>
      <td>GPIO52</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>GMAC_PHY_RXD0_PAD</td>
      <td>IO</td>
    </tr>
    <tr>
      <td>97</td>
      <td>GPIO53</td>
      <td><strong>GPIO53</strong></td>
      <td>I/O/T</td>
      <td>GPIO53</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>GMAC_PHY_RXD1_PAD</td>
      <td>IO</td>
    </tr>
    <tr>
      <td>98</td>
      <td>GPIO54</td>
      <td><strong>GPIO54</strong></td>
      <td>I/O/T</td>
      <td>GPIO54</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>GMAC_PHY_RXER_PAD</td>
      <td>IO</td>
    </tr>
    <tr>
      <td>104</td>
      <td>GPIO0</td>
      <td><strong>GPIO0</strong></td>
      <td>I/O/T</td>
      <td>GPIO0</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
  </tbody>
</table>

<sup>1</sup> **Bold** marks the default pin functions in the default boot mode. See Section 3.1 *Chip Boot Mode Control*.

<sup>2</sup> Regarding highlighted cells, see Section 2.3.4 *Restrictions for GPIOs and LP GPIOs*.

<sup>3</sup> Each IO MUX function (F*n*, *n* = 0–3) is associated with a *type*. The description of *type* is as follows:

- I – input. O – output. T – high impedance.
- I1 – input; if the pin is assigned a function other than F*n*, the input signal of F*n* is always 1.
- I0 – input; if the pin is assigned a function other than F*n*, the input signal of F*n* is always 0.
<!-- PDF_PAGE_END 22 -->

<!-- PDF_PAGE_BEGIN 23 -->
### 2.3.2 LP IO MUX Functions

When the chip is in Deep-sleep mode, the IO MUX described in Section 2.3.1 *IO MUX Functions* will not work. That is where the LP IO MUX comes in. It allows multiple input/output signals to be a single input/output pin in Deep-sleep mode, as the pin is connected to the LP system and powered by VDD_LP or VDD_BAT.

LP IO pins can be assigned to **LP IO MUX functions**. They can

- Either work as LP GPIOs (**LP_GPIO0, LP_GPIO1, etc.**), connected to the LP CPU
- Or connect to LP peripheral signals (**LP_UART_TXD_PAD, LP_UART_RXD_PAD**) – see Table 2-4 *LP IO MUX Functions*

**Table 2-4. LP Peripheral Signals Routed via LP IO MUX**

<table>
  <thead>
    <tr>
      <th>Pin Function</th>
      <th>Signal</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>LP_UART_TXD_PAD</td>
      <td>Transmit data</td>
      <td rowspan="2">LP UART interface</td>
    </tr>
    <tr>
      <td>LP_UART_RXD_PAD</td>
      <td>Receive data</td>
    </tr>
  </tbody>
</table>

Table 2-5 *LP IO MUX Functions* shows the LP functions of LP IO pins.

**Table 2-5. LP IO MUX Functions**

<table>
  <thead>
    <tr>
      <th rowspan="2">Pin No.</th>
      <th rowspan="2">LP IO Name <sup>1, 2</sup></th>
      <th colspan="4">LP IO MUX Function</th>
    </tr>
    <tr>
      <th>F0</th>
      <th>Type</th>
      <th>F1</th>
      <th>Type</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>LP_GPIO1</td>
      <td>LP_GPIO1</td>
      <td>I/O/T</td>
      <td>LP_GPIO1</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>2</td>
      <td>LP_GPIO2</td>
      <td>LP_GPIO2</td>
      <td>I/O/T</td>
      <td>LP_GPIO2</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>3</td>
      <td>LP_GPIO3</td>
      <td>LP_GPIO3</td>
      <td>I/O/T</td>
      <td>LP_GPIO3</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>4</td>
      <td>LP_GPIO4</td>
      <td>LP_GPIO4</td>
      <td>I/O/T</td>
      <td>LP_GPIO4</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>5</td>
      <td>LP_GPIO5</td>
      <td>LP_GPIO5</td>
      <td>I/O/T</td>
      <td>LP_GPIO5</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>6</td>
      <td>LP_GPIO6</td>
      <td>LP_GPIO6</td>
      <td>I/O/T</td>
      <td>LP_GPIO6</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>7</td>
      <td>LP_GPIO7</td>
      <td>LP_GPIO7</td>
      <td>I/O/T</td>
      <td>LP_GPIO7</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>8</td>
      <td>LP_GPIO8</td>
      <td>LP_GPIO8</td>
      <td>I/O/T</td>
      <td>LP_GPIO8</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>10</td>
      <td>LP_GPIO9</td>
      <td>LP_GPIO9</td>
      <td>I/O/T</td>
      <td>LP_GPIO9</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>11</td>
      <td>LP_GPIO10</td>
      <td>LP_GPIO10</td>
      <td>I/O/T</td>
      <td>LP_GPIO10</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>12</td>
      <td>LP_GPIO11</td>
      <td>LP_GPIO11</td>
      <td>I/O/T</td>
      <td>LP_GPIO11</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>13</td>
      <td>LP_GPIO12</td>
      <td>LP_GPIO12</td>
      <td>I/O/T</td>
      <td>LP_GPIO12</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>14</td>
      <td>LP_GPIO13</td>
      <td>LP_GPIO13</td>
      <td>I/O/T</td>
      <td>LP_GPIO13</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>15</td>
      <td>LP_UART_TXD_PAD</td>
      <td>LP_UART_TXD_PAD</td>
      <td>O</td>
      <td>LP_GPIO14</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>16</td>
      <td>LP_UART_RXD_PAD</td>
      <td>LP_UART_RXD_PAD</td>
      <td>I1</td>
      <td>LP_GPIO15</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>104</td>
      <td>LP_GPIO0</td>
      <td>LP_GPIO0</td>
      <td>I/O/T</td>
      <td>LP_GPIO0</td>
      <td>I/O/T</td>
    </tr>
  </tbody>
</table>

<sup>1</sup> This column lists the LP GPIO names, since LP functions are configured with LP GPIO registers that use LP GPIO numbering.
<!-- PDF_PAGE_END 23 -->

<!-- PDF_PAGE_BEGIN 24 -->
### 2.3.3 Analog Functions

Some IO pins also have **analog functions**, for analog peripherals (such as touch sensor and ADC) in any power mode. Internal analog signals are routed to these analog functions, see Table 2-6 *Analog Functions*.

**Table 2-6. Analog Signals Routed to Analog Functions**

<table>
  <thead>
    <tr>
      <th>Pin Function</th>
      <th>Signal</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>XTAL_32K_N</td>
      <td>Negative clock signal</td>
      <td rowspan="2">32 kHz external clock input/output connected to the oscillator</td>
    </tr>
    <tr>
      <td>XTAL_32K_P</td>
      <td>Positive clock signal</td>
    </tr>
    <tr>
      <td>TOUCH_CHANNEL…</td>
      <td>Touch sensor channel signal</td>
      <td>Touch sensor interface</td>
    </tr>
    <tr>
      <td>ADC…_CHANNEL…</td>
      <td>ADC1/2 channel signal</td>
      <td>ADC1/2 interface</td>
    </tr>
    <tr>
      <td>USB1P1_N…</td>
      <td>USB D-</td>
      <td rowspan="2">USB 2.0 full-speed OTG interface and USB Serial/JTAG function</td>
    </tr>
    <tr>
      <td>USB1P1_P…</td>
      <td>USB D+</td>
    </tr>
    <tr>
      <td>ANA_COMP…</td>
      <td>Voltage of P0/P1</td>
      <td>Analog voltage comparator 0/1 interface</td>
    </tr>
  </tbody>
</table>

Table 2-7 *Analog Functions* shows the analog functions of IO pins.

**Table 2-7. Analog Functions**

<table>
  <thead>
    <tr>
      <th rowspan="2">Pin No.</th>
      <th rowspan="2">Analog IO Name</th>
      <th colspan="2">Analog Function <sup>1</sup></th>
    </tr>
    <tr>
      <th>F0</th>
      <th>F1</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>GPIO1</td>
      <td>XTAL_32K_P</td>
      <td>–</td>
    </tr>
    <tr>
      <td>2</td>
      <td>GPIO2</td>
      <td>TOUCH_CHANNEL1</td>
      <td>–</td>
    </tr>
    <tr>
      <td>3</td>
      <td>GPIO3</td>
      <td>TOUCH_CHANNEL2</td>
      <td>–</td>
    </tr>
    <tr>
      <td>4</td>
      <td>GPIO4</td>
      <td>TOUCH_CHANNEL3</td>
      <td>–</td>
    </tr>
    <tr>
      <td>5</td>
      <td>GPIO5</td>
      <td>TOUCH_CHANNEL4</td>
      <td>–</td>
    </tr>
    <tr>
      <td>6</td>
      <td>GPIO6</td>
      <td>TOUCH_CHANNEL5</td>
      <td>–</td>
    </tr>
    <tr>
      <td>7</td>
      <td>GPIO7</td>
      <td>TOUCH_CHANNEL6</td>
      <td>–</td>
    </tr>
    <tr>
      <td>8</td>
      <td>GPIO8</td>
      <td>TOUCH_CHANNEL7</td>
      <td>–</td>
    </tr>
    <tr>
      <td>10</td>
      <td>GPIO9</td>
      <td>TOUCH_CHANNEL8</td>
      <td>–</td>
    </tr>
    <tr>
      <td>11</td>
      <td>GPIO10</td>
      <td>TOUCH_CHANNEL9</td>
      <td>–</td>
    </tr>
    <tr>
      <td>12</td>
      <td>GPIO11</td>
      <td>TOUCH_CHANNEL10</td>
      <td>–</td>
    </tr>
    <tr>
      <td>13</td>
      <td>GPIO12</td>
      <td>TOUCH_CHANNEL11</td>
      <td>–</td>
    </tr>
    <tr>
      <td>14</td>
      <td>GPIO13</td>
      <td>TOUCH_CHANNEL12</td>
      <td>–</td>
    </tr>
    <tr>
      <td>15</td>
      <td>GPIO14</td>
      <td>TOUCH_CHANNEL13</td>
      <td>–</td>
    </tr>
    <tr>
      <td>16</td>
      <td>GPIO15</td>
      <td>TOUCH_CHANNEL14</td>
      <td>–</td>
    </tr>
    <tr>
      <td>17</td>
      <td>GPIO16</td>
      <td>ADC1_CHANNEL0</td>
      <td>–</td>
    </tr>
    <tr>
      <td>18</td>
      <td>GPIO17</td>
      <td>ADC1_CHANNEL1</td>
      <td>–</td>
    </tr>
    <tr>
      <td>19</td>
      <td>GPIO18</td>
      <td>ADC1_CHANNEL2</td>
      <td>–</td>
    </tr>
    <tr>
      <td>20</td>
      <td>GPIO19</td>
      <td>ADC1_CHANNEL3</td>
      <td>–</td>
    </tr>
    <tr>
      <td>22</td>
      <td>GPIO20</td>
      <td>ADC1_CHANNEL4</td>
      <td>–</td>
    </tr>
    <tr>
      <td>23</td>
      <td>GPIO21</td>
      <td>ADC1_CHANNEL5</td>
      <td>–</td>
    </tr>
    <tr>
      <td>24</td>
      <td>GPIO22</td>
      <td>ADC1_CHANNEL6</td>
      <td>–</td>
    </tr>
    <!-- PDF_PAGE_END 24 -->
    <!-- PDF_PAGE_BEGIN 25 -->
    <tr>
      <td>25</td>
      <td>GPIO23</td>
      <td>ADC1_CHANNEL7</td>
      <td>–</td>
    </tr>
    <tr>
      <td>52</td>
      <td>GPIO24</td>
      <td><strong>USB1P1_N0</strong></td>
      <td>–</td>
    </tr>
    <tr>
      <td>53</td>
      <td>GPIO25</td>
      <td><strong>USB1P1_P0</strong></td>
      <td>–</td>
    </tr>
    <tr>
      <td>55</td>
      <td>GPIO26</td>
      <td>USB1P1_N1</td>
      <td>–</td>
    </tr>
    <tr>
      <td>56</td>
      <td>GPIO27</td>
      <td>USB1P1_P1</td>
      <td>–</td>
    </tr>
    <tr>
      <td>92</td>
      <td>GPIO49</td>
      <td>ADC2_CHANNEL0</td>
      <td>–</td>
    </tr>
    <tr>
      <td>93</td>
      <td>GPIO50</td>
      <td>ADC2_CHANNEL1</td>
      <td>–</td>
    </tr>
    <tr>
      <td>94</td>
      <td>GPIO51</td>
      <td>ADC2_CHANNEL2</td>
      <td>ANA_COMP0</td>
    </tr>
    <tr>
      <td>95</td>
      <td>GPIO52</td>
      <td>ADC2_CHANNEL3</td>
      <td>ANA_COMP0</td>
    </tr>
    <tr>
      <td>97</td>
      <td>GPIO53</td>
      <td>ADC2_CHANNEL4</td>
      <td>ANA_COMP1</td>
    </tr>
    <tr>
      <td>98</td>
      <td>GPIO54</td>
      <td>ADC2_CHANNEL5</td>
      <td>ANA_COMP1</td>
    </tr>
    <tr>
      <td>104</td>
      <td>GPIO0</td>
      <td>XTAL_32K_N</td>
      <td>–</td>
    </tr>
  </tbody>
</table>

<sup>1</sup> **Bold** marks the default pin functions in the default boot mode. See Section 3.1 *Chip Boot Mode Control*.

<sup>2</sup> Regarding highlighted cells, see Section 2.3.4 *Restrictions for GPIOs and LP GPIOs*.
<!-- PDF_PAGE_END 25 -->

<!-- PDF_PAGE_BEGIN 26 -->
### 2.3.4 Restrictions for GPIOs and LP GPIOs

All IO pins of ESP32-P4 have GPIO pin functions, and some have LP GPIO pin functions. However, the IO pins are multiplexed and can be configured for different purposes based on the requirements. Some IOs have restrictions for usage. It is essential to consider the multiplexed nature and the limitations when using these IO pins.

In tables of this chapter, some pin functions are highlighted. The non-highlighted GPIO or LP_GPIO pins are recommended for use first. If more pins are needed, the highlighted GPIOs or LP_GPIOs should be chosen carefully to avoid conflicts with important pin functions.

The highlighted IO pins have one of the following important functions:

- **Strapping pins** – need to be at certain logic levels at startup. See Section 3 *Boot Configurations*.
- **USB1P1_N0/P0** – by default, connected to the USB Serial/JTAG Controller. To function as GPIOs, these pins need to be reconfigured.
- **JTAG interface** – often used for debugging. See Table 2-2 *IO MUX Functions*. To free these pins up, the pin functions USB1P1_N/P of the USB Serial/JTAG Controller can be used instead. See also Section 3.4 *JTAG Signal Source Control*.
- **UART interface** – often used for debugging. See Table 2-2 *IO MUX Functions*.

See also Appendix A – ESP32-P4 Consolidated Pin Overview.
<!-- PDF_PAGE_END 26 -->

<!-- PDF_PAGE_BEGIN 27 -->
## 2.4 Dedicated Interface Pins

Some pins are dedicated to a few important peripherals, such as MIPI DSI and MIPI CSI.

**Table 2-8. Peripheral-Dedicated Signals**

<table>
  <thead>
    <tr>
      <th>Pin Function</th>
      <th>Signal</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>FLASH_CS</td>
      <td>Chip select</td>
      <td rowspan="6">Flash connection</td>
    </tr>
    <tr>
      <td>FLASH_Q</td>
      <td>Data output</td>
    </tr>
    <tr>
      <td>FLASH_WP</td>
      <td>Write protect</td>
    </tr>
    <tr>
      <td>FLASH_HOLD</td>
      <td>Hold</td>
    </tr>
    <tr>
      <td>FLASH_CK</td>
      <td>Clock</td>
    </tr>
    <tr>
      <td>FLASH_D</td>
      <td>Data in</td>
    </tr>
    <tr>
      <td>MIPI DSI PHY 4.02 kΩ EXTERNAL RESISTOR</td>
      <td>External resistor 4.02 kΩ</td>
      <td rowspan="5">MIPI DSI connection</td>
    </tr>
    <tr>
      <td>MIPI DSI PHY DATAP…</td>
      <td>Data positive channel 0/1</td>
    </tr>
    <tr>
      <td>MIPI DSI PHY DATAN…</td>
      <td>Data negative channel 0/1</td>
    </tr>
    <tr>
      <td>MIPI DSI PHY CLKN</td>
      <td>Clock negative channel</td>
    </tr>
    <tr>
      <td>MIPI DSI PHY CLKP</td>
      <td>Clock positive channel</td>
    </tr>
    <tr>
      <td>MIPI CSI PHY 4.02 kΩ EXTERNAL RESISTOR</td>
      <td>External resistor 4.02 kΩ</td>
      <td rowspan="5">MIPI CSI connection</td>
    </tr>
    <tr>
      <td>MIPI CSI PHY DATAP…</td>
      <td>Data positive channel 0/1</td>
    </tr>
    <tr>
      <td>MIPI CSI PHY DATAN…</td>
      <td>Data negative channel 0/1</td>
    </tr>
    <tr>
      <td>MIPI CSI PHY CLKN</td>
      <td>Clock negative channel</td>
    </tr>
    <tr>
      <td>MIPI CSI PHY CLKP</td>
      <td>Clock positive channel</td>
    </tr>
    <tr>
      <td>USB2 OTG PHY DM</td>
      <td>USB D-</td>
      <td rowspan="2">USB 2.0 high-speed OTG connection</td>
    </tr>
    <tr>
      <td>USB2 OTG PHY DP</td>
      <td>USB D+</td>
    </tr>
  </tbody>
</table>

Table 2-9 *Dedicated Interface Pins* lists the peripheral-dedicated functions of pins.

**Table 2-9. Dedicated Interface Pins**

<table>
  <thead>
    <tr>
      <th rowspan="2">Pin No.</th>
      <th rowspan="2">Dedicated Interface Pin</th>
      <th colspan="2">Function <sup>1</sup></th>
    </tr>
    <tr>
      <th>F0</th>
      <th>Type</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>27</td>
      <td>FLASH_CS</td>
      <td>FLASH_CS</td>
      <td>O</td>
    </tr>
    <tr>
      <td>28</td>
      <td>FLASH_Q</td>
      <td>FLASH_Q</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>29</td>
      <td>FLASH_WP</td>
      <td>FLASH_WP</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>31</td>
      <td>FLASH_HOLD</td>
      <td>FLASH_HOLD</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>32</td>
      <td>FLASH_CK</td>
      <td>FLASH_CK</td>
      <td>O</td>
    </tr>
    <tr>
      <td>33</td>
      <td>FLASH_D</td>
      <td>FLASH_D</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>34</td>
      <td>DSI_REXT</td>
      <td>MIPI DSI PHY 4.02 KΩ EXTERNAL RESISTOR</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>35</td>
      <td>DSI_DATAP1</td>
      <td>MIPI DSI PHY DATAP1</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>36</td>
      <td>DSI_DATAN1</td>
      <td>MIPI DSI PHY DATAN1</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>37</td>
      <td>DSI_CLKN</td>
      <td>MIPI DSI PHY CLKN</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>38</td>
      <td>DSI_CLKP</td>
      <td>MIPI DSI PHY CLKP</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>39</td>
      <td>DSI_DATAP0</td>
      <td>MIPI DSI PHY DATAP0</td>
      <td>I/O/T</td>
    </tr>
    <!-- PDF_PAGE_END 27 -->
    <!-- PDF_PAGE_BEGIN 28 -->
    <tr>
      <td>40</td>
      <td>DSI_DATAN0</td>
      <td>MIPI DSI PHY DATAN0</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>42</td>
      <td>CSI_DATAN0</td>
      <td>MIPI CSI PHY DATAN0</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>43</td>
      <td>CSI_DATAP0</td>
      <td>MIPI CSI PHY DATAP0</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>44</td>
      <td>CSI_CLKP</td>
      <td>MIPI CSI PHY CLKP</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>45</td>
      <td>CSI_CLKN</td>
      <td>MIPI CSI PHY CLKN</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>46</td>
      <td>CSI_DATAN1</td>
      <td>MIPI CSI PHY DATAN1</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>47</td>
      <td>CSI_DATAP1</td>
      <td>MIPI CSI PHY DATAP1</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>48</td>
      <td>CSI_REXT</td>
      <td>MIPI CSI PHY 4.02 kΩ EXTERNAL RESISTOR</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>49</td>
      <td>USB_DM</td>
      <td>USB2 OTG PHY DM</td>
      <td>I/O/T</td>
    </tr>
    <tr>
      <td>50</td>
      <td>USB_DP</td>
      <td>USB2 OTG PHY DP</td>
      <td>I/O/T</td>
    </tr>
  </tbody>
</table>
<!-- PDF_PAGE_END 28 -->

<!-- PDF_PAGE_BEGIN 29 -->
## 2.5 Analog Pins

**Table 2-10. Analog Pins**

<table>
  <thead>
    <tr>
      <th>Pin No.</th>
      <th>Pin Name</th>
      <th>Pin Type</th>
      <th>Pin Function</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>78</td>
      <td>FB_DCDC</td>
      <td>—</td>
      <td>Feedback pin of power supply for external DC/DC. It regulates the voltage of VDD_HP_0/1/2/3 together with feedback resistors of external DC/DC</td>
    </tr>
    <tr>
      <td>79</td>
      <td>EN_DCDC</td>
      <td>O</td>
      <td>Enable pin of external DC/DC</td>
    </tr>
    <tr>
      <td>99</td>
      <td>XTAL_N</td>
      <td>—</td>
      <td>External clock input/output connected to chip's crystal or oscillator.</td>
    </tr>
    <tr>
      <td>100</td>
      <td>XTAL_P</td>
      <td>—</td>
      <td>P/N means differential clock positive/negative.</td>
    </tr>
    <tr>
      <td>103</td>
      <td>CHIP_PU</td>
      <td>I</td>
      <td>High: on, enables the chip (powered up).<br>Low: off, disables the chip (powered down).<br>Note: Do not leave the CHIP_PU pin floating.</td>
    </tr>
  </tbody>
</table>
<!-- PDF_PAGE_END 29 -->

<!-- PDF_PAGE_BEGIN 30 -->
## 2.6 Power Supply

### 2.6.1 Power Pins

The chip is powered via the power pins described in Table 2-11 *Power Pins*.

**Table 2-11. Power Pins**

<table>
  <thead>
    <tr>
      <th rowspan="2">Pin No.</th>
      <th rowspan="2">Pin Name</th>
      <th rowspan="2">Direction</th>
      <th colspan="2">Power Supply <sup>1</sup></th>
    </tr>
    <tr>
      <th>Power Domain / Other <sup>3</sup></th>
      <th>IO Pins</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>9</td>
      <td>VDD_LP</td>
      <td>Input</td>
      <td>LP power domain</td>
      <td>LP IO <sup>4</sup></td>
    </tr>
    <tr>
      <td>21</td>
      <td>VDD_IO_0</td>
      <td>Input</td>
      <td>Digital power domain</td>
      <td>HP IO</td>
    </tr>
    <tr>
      <td>26</td>
      <td>VDD_HP_0</td>
      <td>Input</td>
      <td>Digital power domain</td>
      <td></td>
    </tr>
    <tr>
      <td>30</td>
      <td>VDD_FLASHIO<sup>2</sup></td>
      <td>Input</td>
      <td>Flash</td>
      <td>flash IO</td>
    </tr>
    <tr>
      <td>41</td>
      <td>VDD_MIPI_DPHY</td>
      <td>Input</td>
      <td>MIPI PHY</td>
      <td>MIPI IO</td>
    </tr>
    <tr>
      <td>51</td>
      <td>VDD_USBPHY</td>
      <td>Input</td>
      <td>USB PHY</td>
      <td>High-speed USB IO</td>
    </tr>
    <tr>
      <td>54</td>
      <td>VDD_HP_1</td>
      <td>Input</td>
      <td>Digital power domain</td>
      <td></td>
    </tr>
    <tr>
      <td>59</td>
      <td>VDD_PSRAM_0</td>
      <td>Input</td>
      <td>PSRAM</td>
      <td>PSRAM IO</td>
    </tr>
    <tr>
      <td>62</td>
      <td>VDD_IO_4</td>
      <td>Input</td>
      <td>Digital power domain</td>
      <td>HP IO</td>
    </tr>
    <tr>
      <td>67</td>
      <td>VDD_PSRAM_1</td>
      <td>Input</td>
      <td>PSRAM</td>
      <td>PSRAM IO</td>
    </tr>
    <tr>
      <td>71</td>
      <td>VDDO_FLASH</td>
      <td>Output</td>
      <td>Off-package flash, output 50 mA current at the maximum</td>
      <td></td>
    </tr>
    <tr>
      <td>72</td>
      <td>VDDO_PSRAM</td>
      <td>Output</td>
      <td>In-package and off-package PSRAM, output 50 mA current at the maximum</td>
      <td></td>
    </tr>
    <tr>
      <td>73</td>
      <td>VDDO_3</td>
      <td>Output</td>
      <td>Output 50 mA current at the maximum</td>
      <td></td>
    </tr>
    <tr>
      <td>74</td>
      <td>VDDO_4</td>
      <td>Output</td>
      <td>Output 50 mA current at the maximum</td>
      <td></td>
    </tr>
    <tr>
      <td>75</td>
      <td>VDD_LDO</td>
      <td>Input</td>
      <td>Analog power domain, providing power for LDOs</td>
      <td></td>
    </tr>
    <tr>
      <td>76</td>
      <td>VDD_HP_2</td>
      <td>Input</td>
      <td>Digital power domain</td>
      <td></td>
    </tr>
    <tr>
      <td>77</td>
      <td>VDD_DCDCC</td>
      <td>Input</td>
      <td>Analog power domain, providing power for DC/DC control</td>
      <td></td>
    </tr>
    <tr>
      <td>85</td>
      <td>VDD_IO_5</td>
      <td>Input</td>
      <td>Digital power domain</td>
      <td>HP IO</td>
    </tr>
    <tr>
      <td>91</td>
      <td>VDD_HP_3</td>
      <td>Input</td>
      <td>Digital power domain</td>
      <td></td>
    </tr>
    <tr>
      <td>96</td>
      <td>VDD_IO_6</td>
      <td>Input</td>
      <td>Digital power domain</td>
      <td>HP IO</td>
    </tr>
    <tr>
      <td>101</td>
      <td>VDD_ANA</td>
      <td>Input</td>
      <td>Analog power domain</td>
      <td></td>
    </tr>
    <tr>
      <td>102</td>
      <td>VDD_BAT</td>
      <td>Input</td>
      <td>Analog power domain, connecting to external batteries optionally</td>
      <td></td>
    </tr>
    <tr>
      <td>105</td>
      <td>GND</td>
      <td>—</td>
      <td>External ground connection</td>
      <td></td>
    </tr>
  </tbody>
</table>

<sup>1</sup> See in conjunction with Section 2.6.2 *Power Scheme*.

<sup>2</sup> VDD_FLASHIO provides power for flash IO, and the voltage should be adjusted according to the specific flash model. In this document, all related descriptions are based on a 3.3 V flash as an example.

<sup>3</sup> For recommended and maximum voltage and current, see Section 5.1 *Absolute Maximum Ratings* and Section 5.2 *Recommended Operating Conditions*.

<sup>4</sup> LP IO pins are those powered by VDD_LP or VDD_BAT, as shown in Figure 2-2 *ESP32-P4 Power Scheme*. See also Table 2-1 *Pin Overview* > Column *Pin Providing Power*.

### 2.6.2 Power Scheme

The power scheme is shown in Figure 2-2 *ESP32-P4 Power Scheme*.

The components on the chip are powered via voltage regulators.
<!-- PDF_PAGE_END 30 -->

<!-- PDF_PAGE_BEGIN 31 -->
## 2 Pins

**Table 2-12. Voltage Regulators**

<table>
  <thead>
    <tr>
      <th>Voltage Regulator</th>
      <th>Output</th>
      <th>Power Supply</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>HP LDO</td>
      <td>1.1 V</td>
      <td>HP power domain</td>
    </tr>
    <tr>
      <td>LP LDO</td>
      <td>1.1 V</td>
      <td>LP power domain</td>
    </tr>
    <tr>
      <td>Flash LDO</td>
      <td>1.8 V/3.3 V</td>
      <td>Can be configured to power off-package flash</td>
    </tr>
    <tr>
      <td>VDD_PSRAM LDO</td>
      <td>1.9 V</td>
      <td>Can be configured to power in-package PSRAM</td>
    </tr>
    <tr>
      <td>VO3 LDO</td>
      <td>0.5 ~ 2.7 V/3.3 V</td>
      <td>Outputs the VDDO_3 supply rail and can be configured to power external devices</td>
    </tr>
    <tr>
      <td>VO4 LDO</td>
      <td>0.5 ~ 2.7 V/3.3 V</td>
      <td>Outputs the VDDO_4 supply rail and can be configured to power external devices</td>
    </tr>
  </tbody>
</table>

<!-- IMAGE_BEGIN -->
<!-- IMAGE_RECT 0.05,0.32,0.97,0.62 -->
**Figure 2-2. ESP32-P4 Power Scheme**

![Figure 2-2. ESP32-P4 Power Scheme](esp32-p4-datasheet.images/img_p031_01.png)
<!-- IMAGE_AI_GENERATED_DESCRIPTION_BEGIN -->
> Block diagram showing the ESP32-P4 power scheme. The chip is shown as a large rectangle. Along the top edge are input/output power pins (left to right): VDD_LDO, VDD_FLASHIO, VDD_LP, VDD_BAT, VDD_ANA, VDD_DCDCC, EN_DCDC, FB_DCDC, VDD_HP_0/1/2/3, VDD_IO_0/4/5/6, VDD_USBPHY, VDD_MIPI_DPHY, VDD_PSRAM_0/1. External components Flash and DCDC are shown above the chip and connect to the chip pins. Inside the chip, from left to right, are blocks labeled: LDO x 4 (Flash LDO, VDD_PSRAM LDO, VO3 LDO, VO4 LDO), Flash IO, LP IO, LP LDO, HP LDO, a DCDC regulator symbol with feedback connections to FB_DCDC and EN_DCDC, HP IO, USB2.0 PHY, MIPI_DPHY, and PSRAM. Below the LP LDO is a "Low Power System" block, and below the HP LDO is a "High Performance System" block. The label "ESP32-P4" is placed at the bottom right of the chip outline. Red lines indicate power flow from the LDOs to internal blocks.
<!-- IMAGE_AI_GENERATED_DESCRIPTION_END -->
<!-- IMAGE_END -->

### 2.6.3 Chip Power-up and Reset

Once the power is supplied to the chip, its power rails need a short time to stabilize. After that, CHIP_PU – the pin used for power-up and reset – is pulled high to activate the chip. For information on CHIP_PU as well as power-up and reset timing, see Figure 2-3 and Table 2-13.

<!-- IMAGE_BEGIN -->
<!-- IMAGE_RECT 0.10,0.74,0.92,0.93 -->
**Figure 2-3. Visualization of Timing Parameters for Power-up and Reset**

![Figure 2-3. Visualization of Timing Parameters for Power-up and Reset](esp32-p4-datasheet.images/img_p031_02.png)
<!-- IMAGE_AI_GENERATED_DESCRIPTION_BEGIN -->
> Timing diagram with two waveforms. The upper waveform represents the combined power rails VDD_LP, VDD_IO_0, VDD_USBPHY, VDD_PSRAM_0/1, VDD_IO_4, VDD_LDO, VDD_DCDCC, VDD_IO_5, VDD_IO_6, and VDD_ANA, rising from 0 V to 1.8 V/3.3 V. The lower waveform represents CHIP_PU which rises after the power rails stabilize, then briefly drops below V<sub>IL_nRST</sub> and rises again. The interval t<sub>STBL</sub> is marked between the start of the power rail rise and the rising edge of CHIP_PU. The interval t<sub>RST</sub> is marked as the time CHIP_PU stays low (below V<sub>IL_nRST</sub>) during the reset pulse.
<!-- IMAGE_AI_GENERATED_DESCRIPTION_END -->
<!-- IMAGE_END -->
<!-- PDF_PAGE_END 31 -->

<!-- PDF_PAGE_BEGIN 32 -->
## 2 Pins

**Table 2-13. Description of Timing Parameters for Power-up and Reset**

<table>
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Description</th>
      <th>Min (µs)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>t<sub>STBL</sub></td>
      <td>Time reserved for the power rails of VDD_LP, VDD_IO_0, VDD_USBPHY, VDD_PSRAM_0/1, VDD_IO_4, VDD_LDO, VDD_DCDCC, VDD_IO_5, VDD_IO_6 and VDD_ANA to stabilize before the CHIP_PU pin is pulled high to activate the chip</td>
      <td>50</td>
    </tr>
    <tr>
      <td>t<sub>RST</sub></td>
      <td>Time reserved for CHIP_PU to stay below V<sub>IL_nRST</sub> to reset the chip (see Table 5-4)</td>
      <td>1000</td>
    </tr>
  </tbody>
</table>
<!-- PDF_PAGE_END 32 -->

<!-- PDF_PAGE_BEGIN 33 -->
## 2 Pins

### 2.7 Pin Mapping Between Chip and Flash

ESP32-P4 requires off-package flash to store application firmware and data. ESP32-P4 supports up to 64 MB flash, which can be connected through SPI, Dual SPI, and Quad SPI/QPI.

ESP32-P4 includes sixteen-line PSRAM with the operation voltage of 1.8 V. Please note that PSRAM is not pinned out.

Table 2-14 lists the pin mapping between the chip and flash for all SPI modes.

For more information on SPI controllers, see also Section 4.2.2.2 *SPI Controller (SPI)*.

**Table 2-14. Pin Mapping Between Chip and off-package Flash**

<table>
  <thead>
    <tr>
      <th>Pin No.</th>
      <th>Pin Name</th>
      <th>Single SPI</th>
      <th>Dual SPI</th>
      <th>Quad SPI/QPI</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>27</td>
      <td>FLASH_CS</td>
      <td>CS#</td>
      <td>CS#</td>
      <td>CS#</td>
    </tr>
    <tr>
      <td>28</td>
      <td>FLASH_Q</td>
      <td>DO</td>
      <td>DO</td>
      <td>DO</td>
    </tr>
    <tr>
      <td>29</td>
      <td>FLASH_WP</td>
      <td>WP#</td>
      <td>WP#</td>
      <td>WP#</td>
    </tr>
    <tr>
      <td>31</td>
      <td>FLASH_HOLD</td>
      <td>HOLD#</td>
      <td>HOLD#</td>
      <td>HOLD#</td>
    </tr>
    <tr>
      <td>32</td>
      <td>FLSH_CK</td>
      <td>CLK</td>
      <td>CLK</td>
      <td>CLK</td>
    </tr>
    <tr>
      <td>33</td>
      <td>FLSHA_D</td>
      <td>DI</td>
      <td>DI</td>
      <td>DI</td>
    </tr>
  </tbody>
</table>
<!-- PDF_PAGE_END 33 -->

<!-- PDF_PAGE_BEGIN 34 -->
# 3 Boot Configurations

The chip allows for configuring the following boot parameters through strapping pins and eFuse bits at power-up or a hardware reset, without microcontroller interaction.

- **Chip boot mode**
  - Strapping pin: GPIO35, GPIO36, GPIO37 and GPIO38
- **VDDO_FLASH Voltage**
  - eFuse bit: EFUSE_0PXA_TIEH_SEL_0
- **ROM message printing**
  - Strapping pin: GPIO36
  - eFuse bit: EFUSE_UART_PRINT_CONTROL
- **JTAG signal source**
  - Strapping pin: GPIO34
  - eFuse bit: EFUSE_DIS_PAD_JTAG, EFUSE_DIS_USB_JTAG, and EFUSE_JTAG_SEL_ENABLE

The default values of all the above eFuse bits are 0, which means that they are not burnt. Given that eFuse is one-time programmable, once an eFuse bit is programmed to 1, it can never be reverted to 0.

The default values of the strapping pins, namely the logic levels, are determined by pins' internal weak pull-up/pull-down resistors at reset if the pins are not connected to any circuit, or connected to an external high-impedance circuit.

**Table 3-1. Default Configuration of Strapping Pins**

<table>
  <thead>
    <tr>
      <th>Strapping Pin</th>
      <th>Default Configuration</th>
      <th>Bit Value</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>GPIO34</td>
      <td>Floating</td>
      <td>–</td>
    </tr>
    <tr>
      <td>GPIO35</td>
      <td>Weak pull-up</td>
      <td>1</td>
    </tr>
    <tr>
      <td>GPIO36</td>
      <td>Floating</td>
      <td>–</td>
    </tr>
    <tr>
      <td>GPIO37</td>
      <td>Floating</td>
      <td>–</td>
    </tr>
    <tr>
      <td>GPIO38</td>
      <td>Floating</td>
      <td>–</td>
    </tr>
  </tbody>
</table>

To change the bit values, the strapping pins should be connected to external pull-down/pull-up resistors. If the ESP32-P4 is used as a device by a host MCU, the strapping pin voltage levels can also be controlled by the host MCU.

All strapping pins have latches. At chip reset, the latches sample the bit values of their respective strapping pins and store them until the chip is powered down or shut down. The states of latches cannot be changed in any other way. It makes the strapping pin values available during the entire chip operation, and the pins are freed up to be used as regular IO pins after reset.

The timing of signals connected to the strapping pins should adhere to the *setup time* and *hold time* specifications in Table 3-2 and Figure 3-1.
<!-- PDF_PAGE_END 34 -->

<!-- PDF_PAGE_BEGIN 35 -->
## 3 Boot Configurations

**Table 3-2. Description of Timing Parameters for the Strapping Pins**

<table>
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Description</th>
      <th>Min (ms)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>t<sub>SU</sub></td>
      <td><em>Setup time</em> is the time reserved for the power rails to stabilize before the CHIP_PU pin is pulled high to activate the chip.</td>
      <td>0</td>
    </tr>
    <tr>
      <td>t<sub>H</sub></td>
      <td><em>Hold time</em> is the time reserved for the chip to read the strapping pin values after CHIP_PU is already high and before these pins start operating as regular IO pins.</td>
      <td>3</td>
    </tr>
  </tbody>
</table>

<!-- IMAGE_BEGIN -->
<!-- IMAGE_RECT 0.18,0.22,0.85,0.50 -->
**Figure 3-1. Visualization of Timing Parameters for the Strapping Pins**

![Figure 3-1. Visualization of Timing Parameters for the Strapping Pins](esp32-p4-datasheet.images/img_p035_01.png)
<!-- IMAGE_AI_GENERATED_DESCRIPTION_BEGIN -->
> Timing diagram with two waveforms. The upper waveform CHIP_PU rises from low to high, crossing the threshold V<sub>IH_nRST</sub>. The lower waveform represents the strapping pin voltage; it rises later than CHIP_PU, crossing V<sub>IH</sub>, stays high for some time, and then falls back. The interval t<sub>SU</sub> (setup time) is marked from the rising edge of CHIP_PU (at V<sub>IH_nRST</sub>) to the rising edge of the strapping pin (at V<sub>IH</sub>). The interval t<sub>H</sub> (hold time) is marked from the rising edge of the strapping pin to its falling edge.
<!-- IMAGE_AI_GENERATED_DESCRIPTION_END -->
<!-- IMAGE_END -->

### 3.1 Chip Boot Mode Control

GPIO35–GPIO38 control the boot mode after the reset is released. See Table 3-3 *Chip Boot Mode Control*.

**Table 3-3. Boot Mode Control**

<table>
  <thead>
    <tr>
      <th>Boot Mode</th>
      <th>GPIO35</th>
      <th>GPIO36</th>
      <th>GPIO37<sup>3</sup></th>
      <th>GPIO38<sup>3</sup></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>SPI Boot</strong></td>
      <td><strong>1</strong></td>
      <td>Any value</td>
      <td>Any value</td>
      <td>Any value</td>
    </tr>
    <tr>
      <td>Joint Download Boot<sup>2</sup></td>
      <td>0</td>
      <td>1</td>
      <td>Any value</td>
      <td>Any value</td>
    </tr>
  </tbody>
</table>

<sup>1</sup> **Bold** marks the default value and configuration.

<sup>2</sup> Joint Download Boot mode supports the following download methods:
- USB Download Boot:
  – USB-Serial-JTAG Download Boot
  – USB 2.0 OTG Download Boot (only the USB OTG HS controller can be used for flashing at FS speed; the USB OTG FS controller does not support device firmware upgrade)
- UART Download Boot
- SPI Slave Download Boot

<sup>3</sup> For details about the functionalities of GPIO37 and GPIO38, see *ESP32-P4 Technical Reference Manual* > Chapter *Chip Boot Control*.

In SPI Boot mode, the ROM bootloader loads and executes the program from SPI flash to boot the
<!-- PDF_PAGE_END 35 -->

<!-- PDF_PAGE_BEGIN 36 -->
## 3 Boot Configurations

system.

In Joint Download Boot mode, users can download binary files into flash using USB, UART0, or SPI slave interface. It is also possible to download binary files into L2MEM and execute them from L2MEM.

In addition to SPI Boot and Joint Download Boot modes, ESP32-P4 also supports SPI Download Boot mode. For details, please see *ESP32-P4 Technical Reference Manual* > Chapter *Chip Boot Control*.

### 3.2 VDDO_FLASH Voltage Control

ESP32-P4 supplies power to flash via VDDO_FLASH, which outputs 3.3 V by default. After burning EFUSE_0PXA_TIEH_SEL_0, the output changes to 1.8 V.

**Table 3-4. VDDO_FLASH Voltage Control**

<table>
  <thead>
    <tr>
      <th>VDDO_FLASH power source <sup>2</sup></th>
      <th>EFUSE_0PXA_TIEH_SEL_0</th>
      <th>Voltage</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2">Flash LDO</td>
      <td><strong>0</strong></td>
      <td><strong>3.3 V</strong></td>
    </tr>
    <tr>
      <td>2</td>
      <td>1.8 V</td>
    </tr>
  </tbody>
</table>

<sup>1</sup> **Bold** marks the default value and configuration.

<sup>2</sup> See Section 2.6.2 *Power Scheme*.

### 3.3 ROM Messages Printing Control

During the boot process, the messages by the ROM code can be printed to:

- (Default) UART0 and USB Serial/JTAG controller
- USB Serial/JTAG controller
- UART0

EFUSE_UART_PRINT_CONTROL and GPIO36 control ROM messages printing to **UART0** as shown in Table 3-5 *UART0 ROM Message Printing Control*.

**Table 3-5. UART0 ROM Message Printing Control**

<table>
  <thead>
    <tr>
      <th>UART0 ROM Code Printing</th>
      <th>EFUSE_UART_PRINT_CONTROL</th>
      <th>GPIO36</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="3"><strong>Enabled</strong></td>
      <td><strong>0</strong></td>
      <td><strong>Ignored</strong></td>
    </tr>
    <tr>
      <td>1</td>
      <td>0</td>
    </tr>
    <tr>
      <td>2</td>
      <td>1</td>
    </tr>
    <tr>
      <td rowspan="3">Disabled</td>
      <td>1</td>
      <td>1</td>
    </tr>
    <tr>
      <td>2</td>
      <td>0</td>
    </tr>
    <tr>
      <td>3</td>
      <td>Ignored</td>
    </tr>
  </tbody>
</table>

<sup>1</sup> **Bold** marks the default value and configuration.

EFUSE_DIS_USB_SERIAL_JTAG_ROM_PRINT controls the printing to **USB Serial/JTAG controller** as shown in Table 3-6 *USB Serial/JTAG ROM Message Printing Control*.
<!-- PDF_PAGE_END 36 -->

<!-- PDF_PAGE_BEGIN 37 -->
## 3 Boot Configurations

**Table 3-6. USB Serial/JTAG ROM Message Printing Control**

<table>
  <thead>
    <tr>
      <th>USB Serial/JTAG ROM Code Printing</th>
      <th>EFUSE_DIS_USB_SERIAL_JTAG_ROM_PRINT</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Enabled</strong></td>
      <td><strong>0</strong></td>
    </tr>
    <tr>
      <td>Disabled</td>
      <td>1</td>
    </tr>
  </tbody>
</table>

<sup>1</sup> **Bold** marks the default value and configuration.

### 3.4 JTAG Signal Source Control

The strapping pin GPIO34 can be used to control the source of JTAG signals during the early boot process. This pin does not have any internal pull resistors and the strapping value must be controlled by the external circuit that cannot be in a high impedance state.

As Table 3-7 *JTAG Signal Source Control* shows, GPIO34 is used in combination with EFUSE_DIS_PAD_JTAG, EFUSE_DIS_USB_JTAG, and EFUSE_JTAG_SEL_ENABLE.

**Table 3-7. JTAG Signal Source Control**

<table>
  <thead>
    <tr>
      <th>JTAG Signal Source</th>
      <th>EFUSE_DIS_PAD_JTAG</th>
      <th>EFUSE_DIS_USB_JTAG</th>
      <th>EFUSE_JTAG_SEL_ENABLE</th>
      <th>GPIO34</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="3"><strong>USB Serial/JTAG Controller</strong></td>
      <td><strong>0</strong></td>
      <td><strong>0</strong></td>
      <td><strong>0</strong></td>
      <td><strong>Ignored</strong></td>
    </tr>
    <tr>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>1</td>
    </tr>
    <tr>
      <td>1</td>
      <td>0</td>
      <td>Ignored</td>
      <td>Ignored</td>
    </tr>
    <tr>
      <td rowspan="2">JTAG pins <sup>2</sup></td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
    </tr>
    <tr>
      <td>0</td>
      <td>1</td>
      <td>Ignored</td>
      <td>Ignored</td>
    </tr>
    <tr>
      <td>JTAG is disabled</td>
      <td>1</td>
      <td>1</td>
      <td>Ignored</td>
      <td>Ignored</td>
    </tr>
  </tbody>
</table>

<sup>1</sup> **Bold** marks the default value and configuration.

<sup>2</sup> JTAG pins refer to MTDI, MTCK, MTMS, and MTDO.
<!-- PDF_PAGE_END 37 -->

<!-- PDF_PAGE_BEGIN 38 -->
# 4 Functional Description

## 4.1 System

This section describes the core of the chip's operation, covering its microprocessor, DMA controllers, memory organization, system components, and security features.

### 4.1.1 Microprocessor and Master

This subsection describes the core processing units within the chip and their capabilities.

#### 4.1.1.1 High-Performance CPU

ESP32-P4 has an HP 32-bit RISC-V dual-core processor with the following features:

**Feature List**

- Five-stage pipeline that supports clock frequency of up to 400 MHz
- RV32IMAFC ISA (instruction set architecture)
- Zc extensions (Zcb, Zcmp, and Zcmt)
- Zb extensions
- Custom AI and DSP extension (XespV)
- Custom hardware loop instructions (XespLoop)
- Compliant with RISC-V Core Local Interrupt (CLINT)
- Compliant with RISC-V Core-Local Interrupt Controller (CLIC)
- Branch predictor BHT, BTB, and RAS
- Up to three hardware breakpoints/watchpoints
- Up to 32 PMP regions and 16 PMA regions
- Machine and User privilege modes
- USB/JTAG for debugging
- Compliant with RISC-V debug specification v0.13
- Offline trace debug that is compliant with RISC-V Trace Specification v2.0

#### 4.1.1.2 RISC-V Trace Encoder (TRACE)

The RISC-V Trace Encoder in the ESP32-P4 chip provides a way to capture detailed trace information from the High-Performance CPU's execution, enabling deeper analysis and optimization of the system. It connects to the HP CPU's instruction trace interface and compresses the information into smaller packets, which are then stored in internal SRAM.
<!-- PDF_PAGE_END 38 -->

<!-- PDF_PAGE_BEGIN 39 -->
## 4 Functional Description

**Feature List**

- Compatible with Efficient Trace for RISC-V v2.0
- Delta address mode and full address mode
- A filter unit
- Notifying an instruction address via debug trigger or filter unit
- Support for the following sideband signals to control trace data flow:
  – Debugging trigger to start or end encoder
  – When the hart is halted, the encoder can report the last packet and then stop
  – When the hart is reset, the encoder can report the last packet and then stop
  – Stalling the hart when FIFO is almost full
- Arbitrary address range of the trace memory size
- Configurable synchronization modes:
  – Synchronization counter counts by packet
  – Synchronization counter counts by cycle
  – Synchronization counter can be disabled
- Trace lost status to indicate packet loss
- Automatic restart after packet loss
- Memory writing in the loop or non-loop mode
- Two interrupts:
  – Triggered when the packet size exceeds the configured memory space
  – Triggered when a packet is lost
- FIFO (128 × 8 bits) to buffer packets
- AHB burst transmission with configurable burst length

#### 4.1.1.3 Processor Instruction Extensions

The ESP32-P4 HP 32-bit RISC-V dual-core processor supports standard RV32IMAFCZc extensions, and it also contains a custom extended instruction set Xhwlp which reduces the number of instructions in the loop body to improve performance, and a custom AI and DSP extension Xai to improve operation efficiency of specific AI and DSP algorithms.

**Feature List**

- Eight new 128-bit general-purpose registers
- 128-bit vector operations, including complex multiplication, addition, subtraction, multiplication, shifting, and comparison
- Combined data handling instructions and load/store operation instructions
<!-- PDF_PAGE_END 39 -->

<!-- PDF_PAGE_BEGIN 40 -->
## 4 Functional Description

- Aligned and unaligned 128-bit vector data load/store
- Configurable rounding and saturation modes

#### 4.1.1.4 Low-Power CPU

ESP32-P4 integrates an LP 32-bit RISC-V single-core processor. This LP CPU is designed as a simplified, low-power replacement of HP CPU in sleep modes. It can be also used to supplement the functions of the HP CPU in normal working mode. The LP CPU and LP memory remain powered on in Deep-sleep mode. Hence, the developer can store a program for the LP CPU in the LP memory to access LP IO, LP peripherals, and real-time timers in Deep-sleep mode.

**Feature List**

- Two-stage pipeline that supports a clock frequency of up to 40 MHz
- RV32IMAC ISA (instruction set architecture)
- 18 vector interrupts
- Debug module compliant with RISC-V External Debug Support Version 0.13 with external debugger support over an industry-standard JTAG/USB port
- Hardware trigger compliant with RISC-V External Debug Support Version 0.13 with up to 2 breakpoints/watchpoints
- Core performance metric events
- Wake-up interrupt for HP CPU
- Access to HP memory and LP memory
- Access to the entire peripheral address space

### 4.1.2 System DMA

This subsection describes the system DMA.

#### 4.1.2.1 GDMA Controller (GDMA-AHB, GDMA-AXI)

General Direct Memory Access (GDMA) is a feature that allows peripheral-to-memory, memory-to-peripheral, and memory-to-memory data transfer at high speed. The CPU is not involved in the GDMA transfer and therefore is more efficient with less workload.

ESP32-P4 has two types of general-purpose DMA controllers, namely GDMA-AHB and GDMA-AXI, to directly access the AHB bus or the AXI bus respectively.

**Feature List**

- Architecture:
  – GDMA-AHB: AHB bus architecture
  – GDMA-AXI: AXI bus architecture, which gives the possibility to complete up to eight transactions out of order and up to eight outstanding transactions
<!-- PDF_PAGE_END 40 -->

<!-- PDF_PAGE_BEGIN 41 -->
## 4 Functional Description

- Programmable length of data to be transferred in bytes
- Access via any address and size
- Alignment:
  – GDMA-AHB:
    * Descriptor address: 1-word aligned
    * Data address and length:
      · Internal memory and non-encrypted external memory address space: no requirements
      · Encrypted external memory address space: 16-byte aligned
  – GDMA-AXI:
    * Descriptor address: 2-word aligned
    * Data address and length:
      · Internal memory and non-encrypted external memory address space: no requirements
      · Encrypted external memory address space: 16-byte aligned
- Linked list of descriptors
- INCR4/INCR8/INCR16 burst transfers when accessing memory via GDMA-AHB
- Three transmit channels and three receive channels for each controller
- Software-configurable selection of peripheral requesting its service
- Configurable channel priority and weight arbitration
- Support for memory transfer
- Linked list switch interrupt mechanism (only supported by GDMA-AXI)
- CRC calculation of data

#### 4.1.2.2 VDMA Controller (VDMA)

DMA (Direct Memory Access) enables direct access to system memory or peripherals without CPU involvement. The VDMA controller on ESP32-P4 is a general-purpose DMA that performs high-speed data transfer from memory to memory, from memory to peripheral, and from peripheral to memory. The VDMA complies with the AXI3 protocol and includes two AXI master interfaces. This design allows users to select between the two interfaces for data transfer dynamically.

**Feature List**

- Four channels for unidirectional data transfer from source to destination
- Two AXI master interfaces
- Handshake with MIPI DSI (Display Serial Interface) and ISP (Image Signal Processor)
- Memory-to-memory, ISP-to-memory, and MIPI DSI-to-memory transfer types
- Multiple levels of DMA transfer hierarchy
<!-- PDF_PAGE_END 41 -->

<!-- PDF_PAGE_BEGIN 42 -->
## 4 Functional Description

- Configurable transfer type, transfer length, and transfer size for each channel
- Single-block transfer
- Multi-block transfer based on contiguous address, automatic reloading register configuration, shadow registers, and linked lists
- Independent configuration of multi-block transfer type for source transfer and destination transfer
- Channel disabling without data loss
- Channel suspension, resume, and abortion
- Configurable priorities among arbitration channels
- Flow control using VDMA or peripherals
- Programmable mapping between peripherals and channels

#### 4.1.2.3 2D-DMA Controller (2D-DMA)

The 2D-DMA controller is a DMA (Direct Memory Access) dedicated to two-dimensional image processing. In addition to all the features of GDMA-AXI, it includes support for macroblock reordering and color space conversion (CSC) to better meet the data transfer requirements from JPEG and PPA. Notably, the 2D-DMA facilitates memory-to-memory transfers, enabling the movement of macroblocks between different segments of memory address space while concurrently performing color space conversion.

**Feature List**

- One AXI master interface
- Data transfer with unaligned starting addresses
- Memory-to-memory, peripheral-to-memory (RX), and memory-to-peripheral (TX) data transfer
- Four memory-to-peripheral channels, and three peripheral-to-memory channels
- Support for PPA and JPEG Codec
- Macroblock reordering
- Color space conversion
- Configurable channel priority and weight

### 4.1.3 Memory Organization

This subsection describes the memory arrangement to explain how data is stored, accessed, and managed for efficient operation.

Figure 4-1 *Address Mapping Structure* illustrates the address mapping structure of ESP32-P4.
<!-- PDF_PAGE_END 42 -->

<!-- PDF_PAGE_BEGIN 43 -->
## 4 Functional Description

<!-- IMAGE_BEGIN -->
<!-- IMAGE_RECT 0.05,0.05,0.95,0.78 -->
**Figure 4-1. Address Mapping Structure**

![Figure 4-1. Address Mapping Structure](esp32-p4-datasheet.images/img_p043_01.png)
<!-- IMAGE_AI_GENERATED_DESCRIPTION_BEGIN -->
> The diagram shows the address mapping structure of the ESP32-P4. Two columns of address ranges are presented: the left column labeled "HP-CORE0/1" and the right column labeled "ULP(LP-CORE)". Both columns contain identical address range blocks from 0x0000_0000 to 0xFFFF_FFFF.
>
> Address ranges shown (top to bottom):
> - 0x0000_0000–0x300F_FFFF
> - 0x3010_0000–0x3010_1FFF → connects to "HP RAM (8KB)"
> - 0x3010_2000–0x3FEF_FFFF
> - 0x3FF0_0000–0x3FF1_FFFF → connects to "CPU Peripheral"
> - 0x3FF2_0000–0x3FFF_FFFF
> - 0x4000_0000–0x43FF_FFFF → connects through "Cache" labeled FLASH
> - 0x4400_0000–0x47FF_FFFF → connects through "Cache" labeled PSRAM
> - 0x4800_0000–0x4BFF_FFFF
> - 0x4C00_0000–0x4BFF_FFFF → connects through "Cache" labeled L2ROM
> - 0x4FC0_0000–0x4FC1_FFFF
> - 0x4FC2_0000–0x4FEF_FFFF → connects through "Cache" labeled L2MEM
> - 0x4FF0_0000–0x4FFB_FFFF
> - 0x4FFC_0000–0x4FFF_FFFF
> - 0x5000_0000–0x500F_FFFF → connects to "HP APB Peripheral"
> - 0x5010_0000–0x5010_3FFF → connects to "LP ROM (16KB)"
> - 0x5010_4000–0x5010_7FFF
> - 0x5010_8000–0x5010_FFFF → connects to "LP RAM (32KB)"
> - 0x5011_0000–0x5012_FFFF → connects to "LP APB Peripheral"
> - 0x5013_0000–0x7FFF_FFFF
> - 0x8000_0000–0x83FF_FFFF (non-cacheable)
> - 0x8400_0000–0x87FF_FFFF (non-cacheable)
> - 0x8800_0000–0x8BFB_FFFF (non-cacheable)
> - 0x8BFC_0000–0x8BFC_1FFF
> - 0x8BFC_2000–0x8BEF_FFFF (non-cacheable)
> - 0x8BF0_0000–0x8BFB_FFFF
> - 0x8BFC_0000–0xFFFF_FFFF
>
> On the left side of the diagram, blocks labeled "L2MEM (768KB)" and "L2ROM (128KB)" connect to the Cache. An "External Memory" block connects to an "MMU" block, which routes to the address space via non-cacheable paths. The Cache block routes through the MMU to L2MEM and L2ROM blocks. CPU Peripheral, HP APB Peripheral, LP ROM, LP RAM, and LP APB Peripheral blocks are shown as destinations from specific address ranges in both the HP-CORE0/1 and ULP(LP-CORE) columns.
<!-- IMAGE_AI_GENERATED_DESCRIPTION_END -->
<!-- IMAGE_END -->

#### 4.1.3.1 System and Memory

**Internal Memory**

ESP32-P4's internal memory includes:

- **128 KB of HP ROM**: 200 MHz, for HP CPU booting and core functions
- **768 KB of HP L2MEM**: 200 MHz, for HP CPU data and instructions
- **16 KB of LP ROM**: 40 MHz, for LP CPU booting and core functions
- **32 KB of LP SRAM**: 40 MHz, for LP CPU data and instructions
- **4 Kbit of eFuse**: 1792 bits are reserved for user data, such as encryption key and device ID
- **8 KB of SPM (Scratchpad Memory)**: 400 MHz, for HP CPU fast access
<!-- PDF_PAGE_END 43 -->

<!-- PDF_PAGE_BEGIN 44 -->
## 4 Functional Description

- **In-package PSRAM**
  – The size of PSRAM is detailed in Section 1 *ESP32-P4 Series Comparison*
  – Data bus width: 16 bits
  – Maximum clock frequency: 250 MHz
  – Supports Double Data Rate (DDR) mode, with data transfer on both clock edges
  – Supports up to 64 MB storage
  – Supports hardware XTS-AES encryption/decryption, protecting programs and data stored in PSRAM
  – Through a cache, it can map 64 KB blocks into a 64 MB instruction or data space, supporting 8-bit, 16-bit, 32-bit, and 128-bit read and write operations

The maximum theoretical bandwidth of PSRAM should be calculated using the following formula:

$$\text{Max theoretical bandwidth (PSRAM)} = \text{line\_num} \times \text{edge\_mode} \times \text{PSRAM\_max\_freq}$$

Where:

- line_num is the number of PSRAM data lines, i.e., the data bus width.
- edge_mode is the PSRAM sampling mode: 1 for single-edge sampling, and 2 for double-edge sampling.
- PSRAM_max_freq is the maximum operating clock frequency of the PSRAM.

Using the parameters of the current on-package PSRAM as an example, its maximum theoretical bandwidth is: 16 × 2 × 250 MHz = 8 Gbit/s.

**External Memory**

ESP32-P4 allows connection to memories outside the chip's package via the SPI, Dual SPI, Quad SPI, and QPI interfaces. The maximum clock frequency is 120 MHz.

The external flash can be mapped into the CPU instruction memory space and read-only data memory space. ESP32-P4 supports up to 64 MB of external flash, and hardware encryption/decryption based on XTS-AES to protect users' programs and data in flash.

Through high-speed caches, ESP32-P4 can support at a time up to:

- External flash mapped into 64 MB instruction space as individual blocks of 64 KB
- External flash can also be mapped into 64 MB data space as individual blocks of 64 KB, supporting 8-bit, 16-bit, 32-bit, and 128-bit reads.

> **Note:**
> After ESP32-P4 is initialized, firmware can customize the mapping of external flash into the CPU address space.

#### 4.1.3.2 eFuse Controller

ESP32-P4 contains a 4096-bit eFuse memory to store parameters and user data. The parameters include control parameters for some hardware modules, system data parameters and keys used for the encryption/decryption module. Once an eFuse bit is programmed to 1, it can never be reverted to 0.
<!-- PDF_PAGE_END 44 -->

<!-- PDF_PAGE_BEGIN 45 -->
## 4 Functional Description

**Feature List**

- 4096-bit one-time programmable memory (including up to 1792 bits reserved for custom use)
- Configurable write protection
- Configurable read protection
- Various hardware encoding schemes against data corruption

#### 4.1.3.3 Cache

ESP32-P4 employs the two-level cache structure.

**Feature List**

- 16 KB of L1 instruction cache, 64 B of block size, four-way set associative
- 64 KB of L1 data cache, 64 B of block size, two-way set associative, supporting two writing strategies write-through and write-back
- 128 KB/256 KB/512 KB of L2 cache, 64 B/128 B of block size, eight-way set associative
- Cacheable and non-cacheable access
- Pre-load function
- Lock function
- Critical word first and early restart

### 4.1.4 System Components

This subsection describes the essential components that contribute to the overall functionality and control of the system.

#### 4.1.4.1 GPIO Matrix and IO MUX

The ESP32-P4 chip features 55 GPIO pins, including 16 low-power (LP) GPIO pins and 39 high-performance (HP) GPIO pins. Each pin can be used as a general-purpose I/O, or be connected to an internal peripheral signal.

- Through HP GPIO matrix and HP IO MUX, HP peripheral input signals can be from any GPIO pins, and HP peripheral output signals can be routed to any GPIO pins.
- Through LP GPIO matrix and LP IO MUX, LP peripheral input signals can be from any LP GPIO pins, and LP peripheral output signals can be routed to any LP GPIO pins.

Together these modules provide highly configurable I/O. The 55 GPIO pins are numbered from GPIO0 to GPIO54.

- LP GPIO pins (GPIO0–GPIO15) can be used by either HP or LP peripherals.
- HP GPIO pins (GPIO16–GPIO54) can be used only by HP peripherals.
<!-- PDF_PAGE_END 45 -->

<!-- PDF_PAGE_BEGIN 46 -->
## 4 Functional Description

**Feature List**

**HP GPIO matrix has the following features:**

- A full-switching matrix between HP peripheral input/output signals and the GPIO pins
- 222 HP peripheral input signals sourced from the input of any GPIO pins
- 232 HP peripheral output signals routed to the output of any GPIO pins
- Signal synchronization for HP peripheral inputs based on **HP IO MUX operating clock**
- GPIO Filter hardware for input signal filtering
- Glitch Filter hardware for second-time filtering on input signal
- Sigma delta modulated (SDM) output
- GPIO simple input and output
- HP GPIO Wakeup

**HP IO MUX has the following features:**

- Control of 55 GPIOs (GPIO0–GPIO54) for HP peripherals.
- A configuration register provided for each GPIO pin, to control the pin's input/output, pull-up/pull-down, drive strength, and function selection.
- Better high-frequency digital performance achieved by routing some digital signals (SPI, EMAC) directly from HP IO MUX to peripherals.

**LP GPIO matrix has the following features:**

- A full-switching matrix between the LP peripheral input/output signals and the LP GPIO pins
- 14 LP peripheral input signals sourced from the input of any LP GPIO pins
- 14 LP peripheral output signals routed to the output of any LP GPIO pins
- GPIO Filter hardware for input signal filtering
- GPIO simple input and output
- LP GPIO Wakeup

**LP IO MUX has the following feature:**

- Control of 16 LP GPIO pins (GPIO0–GPIO15) for LP peripherals.
- A configuration register provided for each LP GPIO pin, to control the pin's input/output, pull-up/pull-down, drive strength, function selection, and IO MUX selection.

#### 4.1.4.2 Reset

ESP32-P4 provides four types of reset that occur at different levels, namely CPU Reset, Core Reset, System Reset, and Chip Reset. All reset types mentioned above (except Chip Reset) preserve the data stored in internal memory.

- Four reset types:
  – CPU Reset: resets CPU core. HP CPU0, HP CPU1, and LP CPU can be reset independently:
<!-- PDF_PAGE_END 46 -->

<!-- PDF_PAGE_BEGIN 47 -->
## 4 Functional Description

  * HP CPU0 will be automatically released from reset after chip power-up.
  * HP CPU1 is at reset by default after chip power-up, and needs to be manually released from reset.
  * LP CPU is at reset after chip power-up, and needs to be manually released from reset by configuring the power management unit (PMU).

  – Core Reset: resets the whole digital system except for LP AON. HP core and LP core can be reset independently: HP Core Reset resets HP CPU0, HP CPI1, HP peripherals, HP GPIO, etc., and LP Core Reset resets LP CPU and LP peripherals.
  – System Reset: resets the whole digital system, including the LP system.
  – Chip Reset: resets the whole chip.

- Software reset and hardware reset:
  – Software Reset: triggered via software by configuring the corresponding registers of CPU.
  – Hardware Reset: triggered directly by the hardware.

#### 4.1.4.3 Clock

ESP32-P4 clocks are mainly sourced from oscillator (OSC, including Resistor-Capacitor circuit), crystal (XTAL), and PLL circuit, and then processed by the dividers or selectors, which allows most functional modules to select their working clock according to their power consumption and performance requirements.

ESP32-P4 clocks can be classified into two types depending on their frequencies:

- High speed clocks for devices working at a higher frequency, such as HP CPU0/1 and digital peripherals
  – CPLL_CLK: internal 400 MHz PLL clock. Its reference clock is XTAL_CLK
  – MPLL_CLK: internal 500 MHz PLL clock. Its reference clock is XTAL_CLK
  – SPLL_CLK: internal 480 MHz PLL clock. Its reference clock is XTAL_CLK

- Slow speed clocks for LP system and some peripherals working in low-power mode
  – XTAL32K_CLK: external 32 kHz crystal clock
  – RC_SLOW_CLK: internal slow RC oscillator with adjustable frequency (150 kHz by default)
  – OSC_SLOW_CLK: external slow clock input through XTAL_32K_N, with a frequency of 32 kHz by default. After configuring this GPIO, also configure the Hold function
  – XTAL_CLK: 40 MHz external crystal clock
  – RC_FAST_CLK: internal fast RC oscillator with adjustable frequency (20 MHz by default)
  – PLL_LP_CLK: internal PLL clock with a frequency of 8 MHz by default. Its reference clock can be XTAL32K_CLK

#### 4.1.4.4 Interrupt Matrix

The Interrupt Matrix in the ESP32-P4 chip routes interrupt requests generated by various peripherals to CPU interrupts.
<!-- PDF_PAGE_END 47 -->

<!-- PDF_PAGE_BEGIN 48 -->
## 4 Functional Description

**Feature List**

- 126 peripheral interrupt sources accepted as input
- 32 HP CPU0 peripheral interrupts and 32 HP CPU1 peripheral interrupts generated to HP CPU as output
- Current interrupt status query of peripheral interrupt sources
- Multiple interrupt sources mapping to a single HP CPU0 or HP CPU1 interrupt (i.e., shared interrupts)

#### 4.1.4.5 Event Task Matrix

The Event Task Matrix (ETM) peripheral contains 50 configurable channels. Each channel can map an event of any specified peripheral to a task of any specified peripheral. In this way, peripherals can be triggered to execute specified tasks without CPU intervention.

**Feature List**

- Receive various events from multiple peripherals
- Generate various tasks for multiple peripherals
- 50 independently configurable ETM channels
- An ETM channel can be set up to receive any event, and map it to any task
- Each ETM channel can be enabled independently. If not enabled, the channel will not respond to the configured event and generate the task mapped to that event
- Support for checking event and task status
- Peripherals supporting ETM include GPIO, LED PWM, general-purpose timers, RTC Timer, system timer, MCPWM, temperature sensor, ADC, I2S, LP CPU, GDMA-AHB, GDMA-AXI, 2D DMA, and PMU

#### 4.1.4.6 Low-Power Management

With advanced power-management technologies, ESP32-P4 can switch between different power modes.

- **Active mode**: CPU and all peripherals are powered on.
- **Light-sleep mode**: CPU is paused. Any wake-up events (host, RTC timer, or external interrupts) will wake up the chip. CPU (excluding L2MEM) and most peripherals (See ESP32-P4 Block Diagram) can also be powered down based on requirements to further reduce power consumption.
- **Deep-sleep mode**: CPU (including L2MEM) and most peripherals (See ESP32-P4 Block Diagram) are powered down. Only the LP memory is powered on, and some peripherals of the LP system can be powered down based on requirements.

#### 4.1.4.7 System Timer

ESP32-P4 provides a 52-bit system timer, which can be used to generate tick interrupts for the operating system, or be used as a general timer to generate periodic interrupts or one-time interrupts.
<!-- PDF_PAGE_END 48 -->

<!-- PDF_PAGE_BEGIN 49 -->
## 4 Functional Description

**Feature List**

- Two 52-bit counters and three 52-bit comparators
- Software accessing registers clocked by APB_CLK
- CNT_CLK used for counting, with an average frequency of 16 MHz in two counting cycles
- 40 MHz XTAL_CLK as the clock source of CNT_CLK
- 52-bit alarm values (t) and 26-bit alarm periods (δt)
- Two modes to generate alarms:
  – Target mode: only a one-time alarm is generated based on the alarm value (t)
  – Period mode: periodic alarms are generated based on the alarm period (δt)
- Three comparators generating three independent interrupts based on configured alarm value (t) or alarm period (δt)
- Software configuring the reference count value. For example, the system timer is able to load back the sleep time recorded by RTC timer via software after Light-sleep
- Able to stall or continue running when CPU stalls or enters the on-chip-debugging mode
- Alarm for Event Task Matrix (ETM) event

#### 4.1.4.8 Timer Group (TIMG)

ESP32-P4 chip contains two timer groups. Each timer group consists of two general-purpose timers and one Main System Watchdog Timer (MWDT). The general-purpose timer is based on a 16-bit prescaler and a 54-bit auto-reload-capable up-down counter.

**Feature List**

- A 54-bit time-base counter programmable to incrementing or decrementing
- Three clock sources: PLL_F80M_CLK or XTAL_CLK or RC_FAST_CLK
- A 16-bit clock prescaler, from 2 to 65536
- Able to read real-time value of the time-base counter
- Able to halt and resume the time-base counter
- Programmable alarm generation
- Timer value reload —Auto-reload at alarm or software-controlled instant reload
- Calculate clock frequency —Calculate the measured frequency of the clock based on the crystal clock
- Level interrupt generation
- Support several ETM tasks and events

#### 4.1.4.9 Watchdog Timers (WDT)

ESP32-P4 contains three digital watchdog timers: one in each of the two timer groups (called Main System Watchdog Timers, or MWDT) and one in the LP system (called the RTC Watchdog Timer, or RWDT).
<!-- PDF_PAGE_END 49 -->

<!-- PDF_PAGE_BEGIN 50 -->
## 4 Functional Description

In SPI Boot mode, RWDT and the MWDT in timer group 0 are enabled automatically in order to detect errors that may occur during the flash boot process and facilitate recovery.

ESP32-P4 also has one analog watchdog timer: Super watchdog (SWD). It is an ultra-low-power circuit in analog domain that helps to prevent the system from operating in a sub-optimal state and resets the system if required.

**Feature List**

- Four stages, each with a separately programmable timeout value and timeout action
- Timeout actions:
  – MWDT: interrupt, HP CPU reset, HP core reset
  – RWDT: interrupt, HP CPU reset, HP core reset, system reset
- Flash boot protection under SPI Boot mode at stage 0:
  – MWDT0: HP core reset upon timeout
  – RWDT: system reset upon timeout
- Write protection that makes WDT register read only unless unlocked
- 32-bit timeout counter
- Clock source:
  – MWDT: PLL_F80M_CLK, RC_FAST_CLK or XTAL_CLK
  – RWDT: LP_DYN_SLOW_CLK

#### 4.1.4.10 RTC Timer

RTC Timer is an important module for implementing low power management of ESP32-P4. Based on a 48-bit readable counter, RTC Timer is mainly used as a system timer in low power mode when the timer peripheral in the HP system is unavailable. It also allows for configuring timer interrupts and logging the time when specific events happen in the system.

**Feature List**

- 48-bit counter
- Time logging when one of the following events happens:
  – HP system reset
  – CPU enters stall state
  – CPU exits stall state
  – Crystal powers up
  – Crystal powers down
- Time logging through register configuration
- Occurrence time cached of the most recent two specific events
<!-- PDF_PAGE_END 50 -->

<!-- PDF_PAGE_BEGIN 51 -->
## 4 Functional Description

- Generation of interrupts at target times, which are configurable. It is also possible to configure two target times simultaneously.
- Uninterrupted operation during any reset or sleep mode, except for power-on reset of LP system.

#### 4.1.4.11 Permission Control (PMS)

ESP32-P4 integrates an APM module to manage access permissions.

**Feature List**

- Up to 32 configurable address ranges for each DMA master
- Access permission management for each CPU core to access internal memory, external memory, and peripheral registers
- Support for interrupts
- Support for exception information record

#### 4.1.4.12 System Registers

The System Registers in the ESP32-P4 chip are used to configure various auxiliary chip features.

**Feature List**

- Control External memory encryption and decryption
- Control HP core/LP core debugging
- Control Bus timeout protection

#### 4.1.4.13 Debug Assistant

The Debug Assistant provides a set of functions to help locate bugs and issues during software debugging. It offers various monitoring capabilities and logging features to assist in identifying and resolving software errors efficiently.

**Feature List**

- **Read/write monitoring**: Monitors whether the High-Performance dual-core CPU (HP CPU0 and HP CPU1) bus reads from or writes to a specified memory address space. A detected read or write in the monitored address space will trigger an interrupt.
- **Stack pointer (SP) monitoring**: Monitors whether the SP exceeds the specified address space. A bounds violation will trigger an interrupt.
- **Program counter (PC) logging**: Records the PC value. The developer can get the last PC value at the most recent reset of HP CPU0 or HP CPU1.
- **Bus access logging**: Records the information about bus access. When the HP CPU0, HP CPU1, or the Direct Memory Access controller (DMA) writes a specified value, the Debug Assistant module will record the data type, address of this write operation, and additionally the PC value when the write is performed by HP CPU0 or HP CPU1, and push such information to the HP L2MEM.
<!-- PDF_PAGE_END 51 -->

<!-- PDF_PAGE_BEGIN 52 -->
## 4 Functional Description

#### 4.1.4.14 LP Mailbox

ESP32-P4 integrates an LP Mailbox module which provides an efficient inter-core communication mechanism between the LP CPU and HP CPU0/1. The LP Mailbox module comprises of sixteen 32-bit message registers that the LP CPU and HP CPU0/1 can use to store and exchange message. Inter-core communication between LP CPU and HP CPU0/1 is achieved through an interrupt mechanism implemented within the LP Mailbox module.

**Feature List**

- Sixteen 32-bit message registers for inter-core communication
- LP CPU external interrupt signal
- HP CPU0/1 external interrupt signal

#### 4.1.4.15 Brown-out Detector

With the Brown-out detector, ESP32-P4 monitors the voltage levels of pins VDD_ANA and VDD_BAT. If the voltage on these pins drops below the predefined threshold (defaulting to 2.4 V), the detector triggers signals to shut down certain power-consuming blocks (e.g., flash), ensuring that the digital module has sufficient time to save and transfer important data.

**Feature List**

- Monitors the voltage level of pins VDD_ANA and VDD_BAT
- Two configurable monitoring modes
  – Mode 0: The brown-out detector triggers interrupts when the brown-out counter reaches the predefined threshold and selects the reset mode according to the configuration.
  – Mode 1: The brown-out detector triggers a system reset when the voltage falls below the threshold.
- Configurable voltage-monitoring thresholds and noise tolerance
- Configurable handling modes for under-voltage events

### 4.1.5 Cryptography/Security Component

This subsection describes the security features incorporated into the chip, which safeguard data and operations.

#### 4.1.5.1 AES Accelerator (AES)

ESP32-P4 integrates a hardware AES (Advanced Encryption Standard) accelerator that performs data encryption and decryption using the AES algorithm. It supports two working modes: typical AES and DMA-AES. Overall, compared with software-based AES computation, the hardware AES accelerator significantly improves processing speed. In addition, the ESP32-P4 AES accelerator includes a configurable anti–side-channel attack (anti-DPA) feature, providing enhanced security.
<!-- PDF_PAGE_END 52 -->

<!-- PDF_PAGE_BEGIN 53 -->
## 4 Functional Description

**Feature List**

- Typical AES working mode
  – AES-128/AES-256 encryption and decryption operations compliant with NIST FIPS 197
- DMA-AES working mode
  – AES-128/AES-256 encryption and decryption operations compliant with NIST FIPS 197
  – Block cipher mode compliant with NIST SP 800-38A
    * ECB (Electronic Codebook)
    * CBC (Cipher Block Chaining)
    * OFB (Output Feedback)
    * CTR (Counter)
    * CFB8 (8-bit Cipher Feedback)
    * CFB128 (128-bit Cipher Feedback)
  – GCM (Galois/Counter Mode)
  – Interrupt on completion of computation
- Configurable anti–side-channel attack (anti-DPA) capability

#### 4.1.5.2 ECC Accelerator (ECC)

Elliptic Curve Cryptography (ECC) is an approach to public-key cryptography based on the algebraic structure of elliptic curves. ECC allows smaller keys compared to RSA cryptography while providing equivalent security.

ESP32-P4's ECC accelerator can complete various calculations based on different elliptic curves, thus accelerating the ECC algorithm and ECC-derived algorithms (such as ECDSA).

**Feature List**

- Three different elliptic curves: P-192, P-256, and P-384, as defined in FIPS 186-5
- Two coordinate system options: affine coordinates and Jacobian coordinates
- Multiple point operations, including point addition, point multiplication, and point verification
- Various modular arithmetic operations based on curve order or modulus, including modular addition, subtraction, multiplication, and division
- Interrupt generation and control upon completion of calculation
- Secure operation mode for constant-time point multiplication

#### 4.1.5.3 HMAC Accelerator (HMAC)

The Hash-based Message Authentication Code (HMAC) module computes Message Authentication Codes (MACs) using the SHA-256 hash algorithm and keys as described in RFC 2104. It provides
<!-- PDF_PAGE_END 53 -->

<!-- PDF_PAGE_BEGIN 54 -->
## 4 Functional Description

hardware-accelerated HMAC computation, significantly reducing software complexity and improving performance.

**Feature List**

- Standard HMAC-SHA-256 algorithm
- Only supports configurable hardware peripherals accessing HMAC hash results (downstream mode)
- Compatible with challenge-response authentication algorithms
- Generates required keys for the RSA Digital Signature Peripheral (RSA_DS) in downstream mode
- Re-enables soft-disabled JTAG (downstream mode)

#### 4.1.5.4 RSA Accelerator (RSA)

The RSA accelerator provides hardware support for high-precision computation used in various RSA asymmetric cipher algorithms, significantly reducing the operation time and software complexity. Compared with RSA algorithms implemented solely in software, this hardware accelerator speeds up RSA algorithms significantly. The RSA accelerator also supports operands of different lengths, which provides more flexibility during the computation.

**Feature List**

- Large-number modular exponentiation with two optional acceleration options
- Large-number modular multiplication, up to 4096 bits
- Large-number multiplication, with operands up to 2048 bits
- Operands of different lengths
- Interrupt on completion of computation

#### 4.1.5.5 SHA Accelerator (SHA)

ESP32-P4 integrates an SHA accelerator, which is a hardware device that speeds up the SHA algorithm significantly, compared with an SHA algorithm implemented solely in software. The SHA accelerator integrated in ESP32-P4 has two working modes, Typical SHA and DMA-SHA.

**Feature List**

- The following hash algorithms introduced in FIPS PUB 180-4 Spec.
  – SHA-1
  – SHA-224
  – SHA-256
  – SHA-384
  – SHA-512
  – SHA-512/224
<!-- PDF_PAGE_END 54 -->

<!-- PDF_PAGE_BEGIN 55 -->
## 4 Functional Description

  – SHA-512/256
  – SHA-512/t
- Supports SM3 cryptographic hash algorithm
- Two working modes
  – Typical SHA
  – DMA-SHA
- Interleaved function when working in Typical SHA working mode
- Interrupt function when working in DMA-SHA working mode

#### 4.1.5.6 RSA Digital Signature Peripheral (RSA_DS)

Digital signature technology uses cryptographic algorithms to verify the authenticity and integrity of messages. It can also be used to authenticate a device to a server or to verify whether a message has been tampered with.

ESP32-P4 includes an RSA Digital Signature Peripheral (RSA_DS) that provides hardware acceleration for efficiently generating RSA-based digital signatures. The RSA_DS peripheral uses the RSA_DS_KEY (generated by HMAC or provisioned by the key manager) to decrypt pre-encrypted parameters and compute the signature. All these operations occur entirely in hardware. During the process, sensitive data such as the key for decrypting RSA parameters, the input/output keys of the HMAC key derivation function, or keys provisioned by the key manager remain inaccessible to the user.

**Feature List**

- RSA digital signatures with key length up to 4096 bits
- Encrypted private key data, only decryptable by the RSA_DS peripheral
- SHA-256 digest to protect private key data against tampering by an attacker

#### 4.1.5.7 ECDSA Digital Signature Peripheral (ECDSA_DS)

In cryptography, the Elliptic Curve Digital Signature Algorithm (ECDSA) is an analog of the Digital Signature Algorithm (DSA) which uses elliptic-curve cryptography.

ESP32-P4's ECDSA accelerator efficiently computes signatures while ensuring the confidentiality of the signing process to prevent information leakage. It provides strong security guarantees without impacting performance, making it suitable for high-speed cryptographic operations and protecting user data.

**Feature List**

- Digital signature generation and signature verification
- Three NIST elliptic curves, namely P-192, P-256, and P-384 (as defined in the FIPS 186-5 Specification)
- Multiple hash algorithms, including SHA-224, SHA-256, SHA-384, SHA-512, SHA-512/224, and SHA-512/256 (as defined in the FIPS PUB 180-4 Specification) and the Chinese SM3 algorithm (for detailed definitions, see SM3 Cryptographic Hash Algorithm)
<!-- PDF_PAGE_END 55 -->

<!-- PDF_PAGE_BEGIN 56 -->
## 4 Functional Description

- Chinese SM2 algorithm (for detailed definitions, see Public Key Cryptographic Algorithm SM2 Based on Elliptic Curves)
- Provides high-security features:
  – Implements dynamic access control under different operating states to prevent key leakage caused by any intermediate data exposure
  – Signature generation and verification are fixed-time operations, resistant to side-channel attacks

#### 4.1.5.8 External Memory Encryption and Decryption (XTS_AES)

The ESP32-P4 integrates an External Memory Encryption and Decryption module that complies with the XTS-AES standard algorithm specified in IEEE Std 1619-2007, providing security for users' application code and data stored in the external memory (flash and RAM). Users can store proprietary firmware and sensitive data (e.g., credentials for gaining access to a private network) in the external flash, or store general data in the external RAM.

**Feature List**

- General XTS-AES algorithm, compliant with IEEE Std 1619-2007
- Software-based manual encryption
- High-speed auto encryption without software's participation
- High-speed auto decryption without software's participation
- Encryption and decryption functions jointly enabled/disabled by register configuration, eFuse parameters, and boot mode
- Configurable anti–side-channel attack (anti-DPA) capability
- Independent keys for flash and PSRAM respectively

#### 4.1.5.9 Random Number Generator (RNG)

The ESP32-P4 contains a true random number generator (TRNG), which generates 32-bit random numbers that can be used for cryptographical operations, among other things.

The TRNG in ESP32-P4 generates true random numbers, which means random numbers generated from a physical process, rather than by means of an algorithm. No number generated within the specified range is more or less likely to appear than any other number.

**Features**

- RNG entropy source
  – thermal noise from SAR ADC
  – an asynchronous clock mismatch
  – BUF_CHAIN
<!-- PDF_PAGE_END 56 -->

<!-- PDF_PAGE_BEGIN 57 -->
## 4 Functional Description

#### 4.1.5.10 Key Manager

ESP32-P4 stores and deploys keys with the Key Manager as the security core. Key Manager uses the unique physically unclonable function (PUF) of each chip to generate the hardware unique key (HUK) which is unique to the chip and serves as the root of trust (RoT) for the chip. HUK is automatically generated each time the chip is powered on and disappears when the chip is powered off. In this way, Key Manager secures key storage and deployment.

Key Manager of ESP32-P4 stores key information (non-plaintext information for recovering the key) in external memory, realizing flexible key management functionalities such as unlimited key storage and dynamic key switching.

**Features**

**The HUK Generator has the following features:**

- HUK Generation Mode:
  – Generates a new HUK and its recovery information
- HUK Recovery Mode:
  – Recovers a deployed HUK with its recovery information
- Prompt for HUK recovery error
- Prompt for HUK risk level

**The Key Manager has the following features:**

- Unlimited number of keys
- Specified private key deployment (AES Deploy Mode):
  – Users specify the value of the key
- Negotiated private key deployment (ECDH0 Deploy Mode):
  – Highest security mode: there is no need to worry about the leaks of data in external channels
  – Requires chip initiation to obtain the private key
  – Negotiates the key value between each chip and the user
- Negotiated private key deployment (ECDH1 Deploy Mode):
  – Provides auxiliary key software/scripts to users
  – No need to boot the chip to obtain the private key
- Random key deployment (Random Deploy Mode):
  – Deploys a hardware-generated random key with nobody knowing the exact value
- Private key recovery deployment (Private Key Recovery Mode):
  – Recovers exactly the same key by entering the key information generated during deployment
- Key information export ($key\_info$ Export Mode):
  – Generates unique key information for the same key each time
<!-- PDF_PAGE_END 57 -->

<!-- PDF_PAGE_BEGIN 58 -->
## 4 Functional Description

### 4.2 Peripherals

This section describes the chip's peripheral capabilities, covering connectivity interfaces and on-chip sensors that extend its functionality.

#### 4.2.1 Image Processing

This subsection describes the peripherals for image and voice processing.

##### 4.2.1.1 JPEG Codec

ESP32-P4's JPEG codec is an image codec, which is based on the JPEG baseline standard, for compressing (encoding) and decompressing (decoding) images to reduce the bandwidth required to transmit images or the space required to store images, making it possible to process large-resolution images.

**Feature List**

When used as an encoder, the JPEG codec has the following features:

- Integrated discrete cosine transform algorithm
- Integrated canonical Huffman coding
- RGB888, RGB565, YUV444, YUV422, YUV420 and GRAY as original input image formats
- Supports converting (if needed) and compressing RGB888, RGB565, or YUV444 images into YUV444, YUV422, or YUV420 formats, and supports converting (if needed) and compressing YUV422 images into YUV422 or YUV420 formats. Compression is only available for YUV444, YUV422, and YUV420 formats
- Four configurable quantization coefficient tables with 8-bit or 16-bit precision
- Performance:
  – Still image compression: up to 4K resolution
  – Dynamic image compression: up to 1080P@40fps,720P@70fps (excluding header encoding time)
- Automatically added stuffed zero byte
- Automatically added EOI marker

When used as a decoder, the JPEG codec has the following features:

- Integrated inverse discrete cosine transform algorithm
- Integrated Huffman decoding
- Supported image formats for compressed bitstream decoding: YUV444, YUV422, YUV420, and GRAY.
- Four configurable quantization coefficient tables with 8-bit or 16-bit precision
- Two DC and two AC Huffman tables
- Supports image decoding of any resolution. However, the resolution of the output decoded image differs from the format of the input image:
  – YUV444, GRAY: both the horizontal and vertical resolutions of the output decoded image are multiples of 8, i.e., 150 × 150 images with an output resolution of 152 × 152
<!-- PDF_PAGE_END 58 -->

<!-- PDF_PAGE_BEGIN 59 -->
## 4 Functional Description

  – YUV422: the horizontal resolution of the output decoded image is the multiples of 16 and the vertical resolution is multiples of 8, i.e., 150 × 150 images with an output resolution of 160 × 152
  – YUV420: both the horizontal and vertical resolutions of the output decoded image are multiples of 16, i.e., 150 × 150 images with an output resolution of 160 × 160
- Performance:
  – Still image decoding: up to 4K resolution
  – Dynamic image decoding: up to 1080P@40fps, 720P@70fps (excluding header parsing time)

**Pin Assignment**

The JPEG Codec does not interact directly with IOs, so it has no pins assigned.

##### 4.2.1.2 Image Signal Processor (ISP)

ESP32-P4 includes an image signal processor (ISP), which is a pipeline composed of various image processing algorithms.

**Feature List**

- Maximum resolution: 1920 x 1080
- Three input channels: MIPI-CSI, DVP, and AXI-DMAC
- Supports pixel down-sample and byte swap for MIPI-CSI input
- Input formats: RAW8, RAW10, and RAW12
- Output formats: RAW8, RGB888, RGB565, YUV422, and YUV420
- Pipeline features:
  – Black Level Correction (BLC)
  – Dead Pixel Correction (DPC)
  – Bayer filter (BF)
  – Lens Shading Correction (LSC)
  – Demosaic
  – White Balance Gain (WBG)
  – Color correction matrix (CCM)
  – Gamma correction
  – RGB2YUV
  – Sharpen
  – Contrast/hue/saturation/luminance adjustment (COLOR)
  – YUV_limit
  – YUV2RGB
<!-- PDF_PAGE_END 59 -->

<!-- PDF_PAGE_BEGIN 60 -->
## 4 Functional Description

  – crop
  – Automatic exposure statistics (AE)
  – Automatic focus statistics (AF)
  – Automatic white balance statistics (AWB)
  – Histogram statistics (HIST)

**Pin Assignment**

For the CAM interface of the image signal processor, the pins used can be chosen from any GPIOs via the GPIO Matrix.

##### 4.2.1.3 Pixel-Processing Accelerator (PPA)

ESP32-P4 includes a pixel-processing accelerator (PPA) with scaling-rotation-mirror (SRM) and image blending (BLEND) functionalities.

**Feature List**

- Image rotation, scaling, and mirroring by SRM:
  – Input formats: ARGB8888, RGB888, RGB565, YUV422, YUV420, GRAY
  – Output formats: ARGB8888, RGB888, RGB565, YUV422, YUV420, GRAY
  – Counterclockwise rotation angles: 0°, 90°, 180°, 270°
  – Horizontal and vertical scaling with scaling factors of 4-bit integer part and 8-bit fractional part
  – Horizontal and vertical mirroring
- Blending two layers of the same size and filling images with specific pixels by BLEND:
  – Foreground input formats: ARGB8888, RGB888, RGB565, L4, L8, A4, A8
  – Background input formats: ARGB8888, RGB888, RGB565, YUV422, YUV420, GRAY, L4, L8
  – Output formats: ARGB8888, RGB888, RGB565, YUV422, YUV420, GRAY
  – Layer blending based on the Alpha channel. If layers lack an Alpha channel, it can be provided through register configuration.
  – Special color filtering by setting color-key ranges of foreground and background layers

**Pin Assignment**

The pixel-processing accelerator does not directly interact with IOs, so it has no pins assigned.

##### 4.2.1.4 LCD and Camera Controller (LCD_CAM)

The LCD and Camera controller (LCD_CAM) on the ESP32-P4, consisting of an independent LCD control module and a camera control module, is a versatile component designed to facilitate interfacing with both LCDs and cameras.
<!-- PDF_PAGE_END 60 -->

<!-- PDF_PAGE_BEGIN 61 -->
## 4 Functional Description

**Feature List**

- Operation modes:
  – LCD master TX mode
  – Camera slave RX mode
  – Camera master RX mode
- Simultaneous connection to an external LCD and a camera
- External LCD interface:
  – 8/16/24-bit parallel output modes
  – RGB, MOTO6800, and I8080 LCD formats
  – LCD data retrieved from internal memory or external memory via GDMA
- External camera (DVP image sensor) interface:
  – 8/16-bit parallel input modes
  – Camera data stored in internal or external memory via GDMA
- Interrupt support

**Pin Assignment**

For CAM and LCD interfaces of the Camera-LCD controller, the pins used can be chosen from any GPIOs via the GPIO Matrix.

##### 4.2.1.5 H264 Encoder

ESP32-P4 contains a baseline H264 encoder, which is used for real-time video sequence compression, significantly reducing the total amount of data while minimizing video quality loss.

**Feature List**

- Progressive video input in RGB888, RGB565, YUV444, YUV422, YUV420, and GRAY formats, with a maximum encoding performance of 1080p@30fps (encoding format: YUV420)
- I-frame and P-frame
- GOP mode and dual-stream mode (in dual-stream mode, the total bandwidth of the two video image sequences to be encoded should not exceed 1080p@30fps)
- Intra luma macroblock of 4 x 4 and 16 x 16 partitioning
- All nine prediction modes for 4 x 4 partitioning and all four prediction modes for 16 x 16 partitioning of intra luma macroblock
- All four prediction modes for intra chroma macroblock
- All partition modes of inter prediction macroblock: 4 x 4, 4 x 8, 8 x 4, 8 x 8, 8 x 16, 16 x 8, and 16 x 16
- Motion estimation with the precision of 1/2 and 1/4 pixel
<!-- PDF_PAGE_END 61 -->

<!-- PDF_PAGE_BEGIN 62 -->
## 4 Functional Description

- Search range of inter prediction horizontal motion being [–29.75, +16.75], vertical search range being [–13.75, +13.75]
- Enabling and disabling the deblocking filter
- Context adaptive variable length coding (CAVLC)
- P-skip macroblock
- P slice supporting I macroblock
- Decimate operation of luma and chroma component quantization results
- Fixed QP and rate control at the macroblock level
- MV merge for outputting the MV of each macroblock to memory
- Region of interest (ROI). It can configure up to eight rectangular ROI areas at any position. These ROI areas have fixed priorities and can overlap with each other. Each ROI area can be assigned a fixed QP or QP offset, and a non-ROI area can be specified with a QP offset.

**Pin Assignment**

The H264 encoder does not directly interact with IOs, so it has no pins assigned.

##### 4.2.1.6 MIPI CSI

ESP32-P4 includes one MIPI CSI interface for connecting cameras of the MIPI interface.

**Feature List**

- Compliant with MIPI CSI-2
- Compliant with DPHY v1.1
- 2-lane x 1.5 Gbps
- Input formats: RGB888, RGB666, RGB565, YUV422, YUV420, RAW8, RAW10, and RAW12

**Pin Assignment**

The MIPI CSI interface uses the dedicated digital pins 42–48.

##### 4.2.1.7 MIPI DSI

ESP32-P4 features a MIPI DSI interface for connecting displays of the MIPI interface.

**Feature List**

- Compliant with MIPI DSI
- Compliant with DPHY v1.1
- 2-lane x 1.5 Gbps
- Input formats: RGB888, RGB666, RGB565, YUV422, YUV420, GRAY
- Output formats: RGB888, RGB666, and RGB565
<!-- PDF_PAGE_END 62 -->

<!-- PDF_PAGE_BEGIN 63 -->
## 4 Functional Description

- Using the video mode to output video stream
- Outputting image patterns

**Pin Assignment**

The MIPI DSI interface uses the dedicated digital pins 34–40.

### 4.2.2 Connectivity Interface

This subsection describes the connectivity interfaces on the chip that enable communication and interaction with external devices and networks.

#### 4.2.2.1 UART Controller (UART)

ESP32-P4 has six UART controllers, including five UARTs in the HP system and one low-power (LP) UART.

**Feature List**

**Table 4-1. UART and LP UART Feautre Comparison**

<table>
  <thead>
    <tr>
      <th>UART Feature</th>
      <th>LP UART Feature</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td colspan="2">Programmable baud rate up to 5 MBaud</td>
    </tr>
    <tr>
      <td>260 x 8-bit RAM, shared by TX FIFOs and RX FIFOs of the UART controllers</td>
      <td>20 x 8-bit RAM, shared by the TX FIFO and RX FIFO of LP UART</td>
    </tr>
    <tr>
      <td colspan="2">Full-duplex asynchronous communication</td>
    </tr>
    <tr>
      <td colspan="2">Data bits (5 to 8 bits)</td>
    </tr>
    <tr>
      <td colspan="2">Stop bits (1, 1.5, or 2 bits)</td>
    </tr>
    <tr>
      <td colspan="2">Parity bit</td>
    </tr>
    <tr>
      <td colspan="2">Special character AT_CMD detection</td>
    </tr>
    <tr>
      <td>RS485 protocol</td>
      <td>—</td>
    </tr>
    <tr>
      <td>IrDA protocol</td>
      <td>—</td>
    </tr>
    <tr>
      <td>High-speed data communication using GDMA</td>
      <td>—</td>
    </tr>
    <tr>
      <td colspan="2">Receive timeout</td>
    </tr>
    <tr>
      <td colspan="2">UART as wakeup source</td>
    </tr>
    <tr>
      <td colspan="2">Software and hardware flow control</td>
    </tr>
    <tr>
      <td>Three prescalable clock sources:<br>1. XTAL_CLK<br>2. RC_FAST_CLK<br>3. PLL_F80M_CLK</td>
      <td>Three prescalable clock sources<br>1. RC_FAST_CLK<br>2. XTAL_DIV_CLK<br>3. PLL_F8M_CLK</td>
    </tr>
  </tbody>
</table>

**Pin Assignment**

For UART0–UART4 interfaces, the pins used can be chosen from any GPIOs via the GPIO Matrix. By default, the pins connected to transmit and receive signals (UART0_TXD_PAD and UART0_RXD_PAD) of UART0 are multiplexed with GPIO37–GPIO38 and the eight-line interface of SPI2 controller via IO MUX.
<!-- PDF_PAGE_END 63 -->

<!-- PDF_PAGE_BEGIN 64 -->
## 4 Functional Description

For LP UART, the pins used can be chosen from any LP GPIOs via the LP GPIO Matrix. By default, the pins connected to transmit and receive signals (LP_UART_TXD_PAD and LP_UART_RXD_PAD) are multiplexed with LP_GPIO14–LP_GPIO15 via LP IO MUX.

#### 4.2.2.2 SPI Controller (SPI)

The Serial Peripheral Interface (SPI) is a synchronous serial interface commonly used for communicating with external peripherals. The ESP32-P4 chip integrates four SPI controllers:

- MSPI controller, including two sub-controllers
  – FLASH MSPI controller
    * FLASH MSPI SPI0
    * FLASH MSPI SPI1
  – PSRAM MSPI controller
    * PSRAM MSPI SPI0
    * PSRAM MSPI SPI1
- General Purpose SPI2 (GP-SPI2)
- General Purpose SPI3 (GP-SPI3)
- Low-Power SPI (LP-SPI)

**Feature List**

**GP-SPI has the following features:**

- Works as master or as slave
- Half- and full-duplex communications
- CPU- and DMA-controlled transfers
- Various data modes
  – **GP-SPI2**
    * 1-bit SPI mode
    * 2-bit Dual SPI mode
    * 4-bit Quad SPI mode
    * QPI mode
    * 8-bit Octal SPI mode (available only when GP-SPI2 works as a master)
    * OPI mode (available only when GP-SPI2 works as a master)
  – **GP-SPI3**
    * 1-bit SPI mode
    * 2-bit Dual SPI mode
    * 4-bit Quad SPI mode
<!-- PDF_PAGE_END 64 -->

<!-- PDF_PAGE_BEGIN 65 -->
## 4 Functional Description

    * QPI mode
- Configurable module clock frequency
  – Master: up to 80 MHz
  – Slave: up to 60 MHz
- Configurable data length
  – CPU-controlled transfer as master or as slave: 1–64 bytes
  – DMA-controlled single transfer as master: 1–32 KB
  – DMA-controlled configurable segmented transfer as master: data length is unlimited
  – DMA-controlled single transfer or segmented transfer as slave: data length is unlimited
- Configurable bit read/write order
- Independent interrupts for CPU-controlled transfer and DMA-controlled transfer
- Configurable clock polarity and phase
- Four SPI clock modes: mode 0–mode 3
- Multiple CS lines as master
  – **GP-SPI2**: CS0–CS5
  – **GP-SPI3**: CS0–CS2
- Able to communicate with SPI devices, such as a sensor, a screen controller, as well as a flash or RAM chip

**LP-SPI is a simplified version of GP-SPI and has a subset of GP-SPI's features:**

- Works as a master or as a slave
- Half- and full-duplex communications
- CPU-controlled transfer
- 1-bit SPI data mode
- Configurable module clock frequency:
  – Master: up to 40 MHz
  – Slave: up to 40 MHz
- Configurable data length:
  – CPU-controlled transfer as master or as slave: 1–64 bytes
- Configurable bit read/write order
- Interrupts for CPU-controlled transfer
- Configurable clock polarity and phase
- Four SPI clock modes: mode 0–mode 3
- One CS line as master: CS0
- Wake-up feature as slave (the only new feature compared with GP-SPI)
<!-- PDF_PAGE_END 65 -->

<!-- PDF_PAGE_BEGIN 66 -->
## 4 Functional Description

**Pin Assignment**

The Flash SPI interface uses the dedicated digital pins 27–33.

The GP-SPI2 controller includes one four-line interface and one eight-line interface. The pins connected to the four-line interface are multiplexed with GPIO6–GPIO11 via the IO MUX. The pins connected to the eight-line interface are multiplexed with GPIO28–GPIO38, UART0 interface, and the first RMII interface of EMAC controller via the IO MUX. If high-speed performance is not critical for the GP-SPI2 interface, you can select pins from any GPIOs via the GPIO Matrix.

For GP-SPI3, the pins used can be chosen from any GPIOs via the GPIO Matrix.

The pins for the LP-SPI interface can be chosen from any pins via the LP GPIO Matrix.

#### 4.2.2.3 I2C Controller (I2C)

ESP32-P4 has three I2C controllers: two in the main system and one in the low-power system. The two I2C controllers in the main system can act as a master or a slave (referred to as I2C below), while the one in the low-power system can only act as a master (referred to as LP_I2C below), which can still work when the main system sleeps.

**Feature List**

The I2C controller of ESP32-P4 has the following features:

- Master mode and slave mode
- Communication between multiple masters and slaves
- Standard mode (100 Kbit/s)
- Fast mode (400 Kbit/s)
- 7-bit addressing and 10-bit addressing
- Continuous data transfer achieved by pulling SCL low in slave mode
- Programmable digital noise filtering
- Dual address mode, which uses slave address and slave memory or register address

**Pin Assignment**

For I2C, the pins used can be chosen from any GPIOs via the GPIO Matrix.

For LP I2C, the pins used can be chosen from any GPIOs via the LP GPIO Matrix.

#### 4.2.2.4 Analog I2C Controller

This module is a dedicated I2C host that communicates with some analog modules to configure parameters of these modules. Each configurable module has an I2C slave with its own address.

**Feature List**

- Master mode only
<!-- PDF_PAGE_END 66 -->

<!-- PDF_PAGE_BEGIN 67 -->
## 4 Functional Description

- 7-bit addressing
- Adjustable transmission rate
- Communication in the sleep modes supported by the Low-Power CPU
- Dual master operation mode

**Pin Assignment**

The analog I2C interface connects internal analog components without requiring allocating IO pins.

#### 4.2.2.5 I3C Controller

ESP32-P4 includes one I3C master interface.

**Feature List**

The I3C master interface supports the following features:

- Compliant with I3C protocol
- Compatible with I2C mode (FM, FM+)
- SDR mode
- Dynamic address allocation
- In-Band interrupts
- DMA transfer

**Pin Assignment**

For I3C master interface, the pins for clock and data signals are multiplexed with GPIO32–GPIO33 via the GPIO matrix. Other signals can be routed to any GPIOs via the GPIO matrix.

#### 4.2.2.6 I2S Controller (I2S)

ESP32-P4 has three built-in I2S interfaces, which provide flexible communication interfaces for streaming digital data in multimedia applications, especially digital audio applications.

**Feature List**

- Master mode and slave mode
- Full-duplex and half-duplex communications
- Separate TX and RX units that can work independently or simultaneously
- A variety of audio standards supported:
  – TDM Philips standard
  – TDM MSB alignment standard
  – TDM PCM standard
<!-- PDF_PAGE_END 67 -->

<!-- PDF_PAGE_BEGIN 68 -->
## 4 Functional Description

  – PDM standard
- Various TX/RX modes supported:
  – TDM TX mode, up to 16 channels supported
  – TDM RX mode, up to 16 channels supported
  – PDM TX mode
    * Raw PDM data transmission
    * PCM-to-PDM data format conversion (for I2S0 only), up to two channels supported
  – PDM RX mode
    * Raw PDM data reception
    * PDM-to-PCM data format conversion (for I2S0 only), up to eight channels supported
- Configurable APLL clock with frequencies up to 125 MHz
- Configurable high-precision sample clock with a variety of sampling frequencies supported
- 8/16/24/32-bit data width
- Synchronous counter in TX mode
- ETM feature
- Direct Memory Access (GDMA-AHB only)
- Standard I2S interface interrupts

**Pin Assignment**

The pins for the I2S interfaces can be chosen from any GPIOs via the GPIO Matrix.

#### 4.2.2.7 LP I2S Controller

ESP32-P4 has a built-in LP I2S interface, which provides a data reception communication interface for Voice Activity Detection (VAD) and some digital audio applications in low power mode.

**Feature List**

- RX master mode and slave mode
- A variety of audio standards supported:
  – TDM Philips standard
  – TDM MSB alignment standard
  – TDM PCM standard
  – PDM standard
- Various RX modes supported:
  – TDM RX mode, up to two channels supported
  – PDM RX mode
<!-- PDF_PAGE_END 68 -->

<!-- PDF_PAGE_BEGIN 69 -->
## 4 Functional Description

    * Raw PDM data reception
    * PDM-to-PCM data format conversion, up to two channels supported
- Configurable sample clock with a variety of sampling frequencies supported
- 16-bit data communication
- Standard LP I2S interface interrupts

**Pin Assignment**

The pins for the LP I2S controller can be chosen from any LP GPIOs via the LP GPIO Matrix.

#### 4.2.2.8 Pulse Count Controller (PCNT)

The pulse count controller (PCNT) is designed to count input pulses.

**Feature List**

- Four independent pulse counters (units) that count from 1 to 65535
- Each unit consists of two independent channels sharing one pulse counter
- All channels have input pulse signals with their corresponding control signals
- Independently filter glitches of input pulse signals and control signals on each unit
- Each channel has the following parameters:
  1. Selection between counting on rising or falling edges of the input pulse signal
  2. Configuration to Increment, Decrement, or Disable counter mode for control signal's high and low states
- Maximum frequency of pulses: $\frac{f_{APB\_CLK}}{2}$

**Pin Assignment**

The pins for the pulse count controller can be chosen from any GPIOs via the GPIO Matrix.

#### 4.2.2.9 USB 2.0 High-Speed OTG

The ESP32-P4 chip features a USB 2.0 High-Speed On-The-Go peripheral (OTG_HS) with an integrated transceiver. This OTG_HS complies with the USB 2.0 specification, OTG Revision 1.3, and OTG Revision 2.0 specifications. The interface supports USB 2.0 High-Speed mode (480 Mbit/s), Full-Speed mode (12 Mbit/s), and Low-Speed mode (1.5 Mbit/s).

- When OTG_HS operates in High-Speed or Full-Speed modes, it can be configured as either a Host or a Device.
- When OTG_HS operates in Low-Speed mode, it can only be configured as a Host.

**Feature List**

**General Features**
<!-- PDF_PAGE_END 69 -->

<!-- PDF_PAGE_BEGIN 70 -->
## 4 Functional Description

- USB 2.0 specification, OTG Revision 1.3 and OTG Revision 2.0 specifications
- High-Speed, Full-Speed, and Low-Speed data rates
- As a host and a device in High-Speed mode and Full-Speed mode
- Dynamic FIFO (DFIFO) sizing, each device EP/host channel can dynamically allocate a maximum of 4 KB FIFO.
- Up to 8 non-periodic transactions and 16 periodic transactions per microframe
- Multiple modes of memory access
  – Scatter/Gather DMA mode
  – Buffer DMA mode
  – Slave Mode
- Integrated UTMI High-Speed transceiver

**Device Mode Features**

- Endpoint 0 always present, bi-directional, consisting of EP0 IN and EP0 OUT
- 15 additional endpoints 1–15, configurable as IN or OUT
- Maximum of eight IN endpoints concurrently active at any time, including EP0 IN
- All OUT endpoints share a single RX FIFO
- Each IN endpoint has a dedicated TX FIFO

**Host Mode Features**

- 16 host channels
- RX FIFO: shared by all periodic and non-periodic transactions
- Two TX FIFO:
  – One shared by all non-periodic transactions
  – One shared by all periodic transactions
- All of the above FIFOs share a 4 KB RAM.
- The size of each FIFO is configurable, with a maximum of 4 KB.

**Pin Assignment**

The pins connected to USB2 OTG PHY DM (USB_D-) and USB2 OTG PHY DP (USB_D+) signals of USB 2.0 High-Speed OTG are dedicated pin49 and pin50. Other signals can be routed to any GPIOs via the GPIO matrix.

#### 4.2.2.10 USB 2.0 Full-Speed OTG

The ESP32-P4 features a USB 2.0 Full-Speed On-The-Go peripheral (henceforth referred to as OTG_FS) along with integrated transceivers. This OTG_FS conforms to USB 2.0 specification, OTG Revision 1.3, and OTG Revision 2.0 specifications, OTG_FS can operate as either a USB Host or Device and supports 12 Mbit/s
<!-- PDF_PAGE_END 70 -->

<!-- PDF_PAGE_BEGIN 71 -->
## 4 Functional Description

full-speed (FS) and 1.5 Mbit/s low-speed (LS) data rates of the USB 2.0 specification. The Host Negotiation Protocol (HNP) and the Session Request Protocol (SRP) are also supported.

**Feature List**

**General Features**

- USB 2.0 specification, OTG Revision 1.3 and OTG Revision 2.0 specifications
- USB 2.0 full-speed and low-speed data rates
- HNP and SRP as A-device or B-device
- Dynamic FIFO (DFIFO) sizing, maximum to 1 KB
- Multiple modes of memory access
  – Scatter/Gather DMA mode
  – Buffer DMA mode
  – Slave mode
- Two integrated transceivers

**Device Mode Features**

- Endpoint 0 always present, bi-directional, consisting of EP0 IN and EP0 OUT
- Six additional endpoints 1–6, configurable as IN or OUT
- Maximum of five IN endpoints concurrently active at any time, including EP0 IN
- All OUT endpoints share a single RX FIFO
- Each IN endpoint has a dedicated TX FIFO

**Host Mode Features**

- Eight host channels
- RX FIFO: shared by all periodic and non-periodic transactions
- Two TX FIFO:
  – One shared by all non-periodic transactions
  – One shared by all periodic transactions
- All of the above FIFOs share a 1 KB RAM.
- The size of each FIFO is configurable, with a maximum of 1 KB.

**Pin Assignment**

The pins connected to D+ and D- signals for two pairs of USB PHY are multiplexed with GPIO24–GPIO25 and GPIO26–GPIO27. The USB 2.0 Full-Speed OTG interface can use each of them. By default, the pins are multiplexed with GPIO26–GPIO27. In addition, the functionalities of USB_D- and USB_D+ can be exchanged.

Other signals can be routed to any GPIOs via the GPIO matrix.
<!-- PDF_PAGE_END 71 -->

<!-- PDF_PAGE_BEGIN 72 -->
## 4 Functional Description

#### 4.2.2.11 USB Serial/JTAG Controller (USB_SERIAL_JTAG)

ESP32-P4 contains a USB Serial/JTAG Controller. This unit can be used to program the SoC's flash, read program output, as well as attach a debugger to the running program.

**Feature List**

- USB 2.0 full speed compliant, capable of up to 12 Mbit/s transfer speed (Note that this controller does not support the faster 480 Mbit/s high-speed transfer mode)
- CDC-ACM virtual serial port and JTAG adapter functionality
- Programming the chip's flash
- CPU debugging with compact JTAG instructions
- A full-speed USB PHY integrated in the chip
- Two integrated full-speed transceivers
- Choosing from two full-speed integrated transceivers GPIO24/GPIO25 and GPIO26/GPIO27
- Supporting USB 2.0 OTG using one of the integrated transceivers while USB Serial/JTAG using the other one

**Pin Assignment**

The pins connected to D+ and D- signals for two pairs of USB PHY are multiplexed with GPIO24–GPIO25 and GPIO26–GPIO27. The USB Serial/JTAG Controller interface can use each of them. By default, the pins are multiplexed with GPIO24–GPIO25.

#### 4.2.2.12 Ethernet Media Access Controller (EMAC)

By using the external Ethernet PHY (physical layer), ESP32-P4 can send and receive data via Ethernet MAC (Media Access Controller) according to the IEEE 802.3 standard.

ESP32-P4 Ethernet MAC complies with the following standards:

- IEEE 802.3-2002 for Ethernet MAC
- IEEE 1588-2008 standard for precise networked clock synchronization
- IEEE 802.3 standard Media Independent Interface (MII) and Reduced Media Independent Interface (RMII)
- IEEE 802.3az-2010 for Energy Efficient Ethernet
- IEEE 802.1Q for VLAN frame format

**Feature List**

- Data rates of 10/100 Mbit/s through an external PHY interface
- Communication with an external Fast Ethernet PHY through IEEE 802.3-compliant MII or RMII interface (only one can be used at a time)
- Full-duplex and half-duplex modes
<!-- PDF_PAGE_END 72 -->

<!-- PDF_PAGE_BEGIN 73 -->
## 4 Functional Description

  – Carrier Sense Multiple Access or Collision Detection (CSMA/CD) protocol in half-duplex mode
  – IEEE 802.3x flow control in full-duplex mode
  – Optional forwarding of received pause control frame to the user application in full-duplex mode
  – Back-pressure flow control in half-duplex mode
  – Automatic transmission of zero-quanta pause frame on deassertion of flow control input in full-duplex mode
- Preamble and start-of-frame data (SFD) insertion in Transmit, and deletion in Receive paths
- Automatic CRC and padding (all 0) generation controllable on a per-frame basis
- Options for automatic padding generation for data below the minimum frame length
- Programmable frame length supporting jumbo frames of up to 16 KB
- Programmable inter-frame gap (IFG) from 40 to 96 bit times in steps of 8
- Flexible address filtering modes:
  – Up to eight 48-bit perfect address filters with per-byte masking
  – Up to eight 48-bit source address (SA) comparisons with per-byte masking
  – Option to pass all multicast addressed frames
  – Promiscuous mode to pass all frames without filtering for network monitoring
  – Passes all incoming packets (as per filter) with a status report
- Separate 32-bit status returned for transmission and reception packets
- IEEE 802.1Q VLAN tag detection for reception frames
- Separate transmission, reception, and control interfaces for the application
- Management Data Input/Output (MDIO) interface for PHY device configuration and management
- Checksum offload for received IPv4 and TCP packets encapsulated by the Ethernet frame
- Checking IPv4 header checksum and TCP, UDP, or ICMP checksum encapsulated in IPv4 or IPv6 datagrams
- 64-bit timestamp for each transmitted and received frame (see IEEE 1588-2008)
- Energy Efficient Ethernet support (see IEEE 802.3az-2010)
- CRC replacement, SA insertion/replacement, and VLAN insertion/replacement/deletion in transmit frames
- Two FIFOs: 256-byte TX FIFO and 256-byte RX FIFO
- Receive status vectors inserted into RX FIFO after the EOF (end of frame) transfer, allowing multiple-frame storage without requiring an additional FIFO for status
- Option to forward good runt frames
- Statistics generation with pulse signaling for dropped or corrupted frames due to RX FIFO overflow
- Automatic re-transmission of collision frames
<!-- PDF_PAGE_END 73 -->

<!-- PDF_PAGE_BEGIN 74 -->
## 4 Functional Description

- Frame discarding in cases of late collisions, excessive collisions, excessive deferrals, or underflow conditions
- Software control for TX FIFO flushing

**Pin Assignment**

The Ethernet media access controller includes only one RMII interface. For flexible pin routing, each RMII signal offers three alternative GPIO mappings:

- RMII Group 1: Signals are multiplexed with GPIO28–GPIO36 and the SPI2 interface via IO MUX.
- RMII Group 2: Signals are multiplexed with GPIO40–GPIO48 via IO MUX.
- RMII Group 3: Provides partial signal routing (excluding transmit signals except for RMII_TXEN) and is multiplexed with GPIO49–GPIO54 via IO MUX.

Each RMII signal can be assigned independently to any of these three groups to form a complete RMII interface.

The MII interface, MDIO interface, and other peripheral signals can be routed to any GPIO via the GPIO Matrix for additional flexibility.

#### 4.2.2.13 Two-Wire Automotive Interface (TWAI)

ESP32-P4 contains three TWAI controllers. Each controller can individually be connected to a TWAI bus via an external transceiver.

**Feature List**

- Compatibility with ISO 11898-1 protocol (CAN Specification 2.0)
- Standard Frame Format (11-bit ID) and Extended Frame Format (29-bit ID)
- Bit rates from 1 Kbit/s to 1 Mbit/s
- Multiple modes of operation:
  – Normal
  – Listen-only (no influence on bus)
  – Self-test (no acknowledgment required during data transmission)
- 64-byte Receive FIFO
- Special transmissions:
  – Single-shot transmissions (does not automatically re-transmit upon error)
  – Self-reception (the TWAI controller transmits and receives messages simultaneously)
- Acceptance Filter (supports Single and Dual-filter modes)
- Error detection and handling:
  – Error counters
  – Configurable error warning limit
<!-- PDF_PAGE_END 74 -->

<!-- PDF_PAGE_BEGIN 75 -->
## 4 Functional Description

  – Error code capture
  – Arbitration lost capture
  – Automatic transceiver standby

**Pin Assignment**

The pins for the two-wire automotive interface can be chosen from any GPIOs via the GPIO Matrix.

#### 4.2.2.14 SD/MMC Host Controller (SDHOST)

ESP32-P4 has an SD/MMC Host Controller.

**Feature List**

- Two external cards
- SD memory Card specification v3.0 and v3.01
- Secure Digital I/O (SDIO 3.0)
- MMC: v4.41, v4.5, and v4.51
- CE-ATA: v1.1
- 1-bit, 4-bit, and 8-bit modes

**Pin Assignment**

For the SD/MMC host controller, card one (SDMMC_HOST_SLOT_0) signals are multiplexed with GPIO39–GPIO48, the second RMII interface of EMAC, and the output signal of 50 MHz clock via IO MUX. Card two (SDMMC_HOST_SLOT_1) signals can be routed to any GPIOs via the GPIO matrix.

For the SDIO2.0 interface, the pins can be chosen from any GPIOs via the GPIO Matrix.

#### 4.2.2.15 LED PWM Controller (LEDC)

The LED PWM Controller is a peripheral designed to generate PWM signals for LED control. It has specialized features such as automatic duty cycle fading. However, the LED PWM Controller can also be used to generate PWM signals for other purposes.

**Feature List**

- Eight independent PWM generators (i.e., eight channels)
- Maximum PWM duty cycle resolution: 20 bits
- Four independent timers that support fractional division
- Adjustable phase of PWM signal output
- PWM duty cycle dithering
- Automatic duty cycle fading —gradual increase/decrease of a PWM's duty cycle without interference from the processor. An interrupt will be generated upon fade completion
<!-- PDF_PAGE_END 75 -->

<!-- PDF_PAGE_BEGIN 76 -->
## 4 Functional Description

- Up to 16 duty cycle ranges for each PWM generator to generate gamma curve signals - each range can be independently configured in terms of fading direction (increase or decrease), fading amount (the amount by which the duty cycle increases or decreases each time), the number of fades (how many times the duty cycle fades in one range), and fading frequency
- PWM signal output in low-power mode (Light-sleep mode)
- Event generation and task response related to the Event Task Matrix (ETM) peripheral

**Pin Assignment**

The pins for the LED PWM controller can be chosen from any GPIOs via the GPIO Matrix.

#### 4.2.2.16 Motor Control PWM (MCPWM)

ESP32-P4 integrates two MCPWMs that can be used to drive digital motors and smart light. Every MCPWM has a clock divider (prescaler), three PWM timers, three PWM operators, a dedicated capture submodule, an Event Task Matrix (ETM) module, and an fault detection module.

**Feature List**

PWM timers are used to generate timing references. The PWM operators generate desired waveform based on the timing references. By configuration, a PWM operator can use the timing reference of any PWM timer, and use the same timing reference with other PWM operators. PWM operators can also use different PWM timers' values to produce independent PWM signals. PWM timers can be synchronized.

**Pin Assignment**

The pins for the motor control PWM can be chosen from any GPIOs via the GPIO Matrix.

#### 4.2.2.17 Remote Control Peripheral (RMT)

The Remote Control Peripheral (RMT) supports four channels of infrared remote transmission and four channels of infrared remote reception. By controlling pulse waveform through software, it supports various infrared and other single wire protocols.

**Feature List**

- Eight channels:
  – TX channels 0–3
  – RX channels 4–7
  – Eight channels share a 384 x 32-bit RAM
- The transmitter supports:
  – Normal TX mode
  – Wrap TX mode
  – Continuous TX mode
  – Modulation on TX pulses
<!-- PDF_PAGE_END 76 -->

<!-- PDF_PAGE_BEGIN 77 -->
## 4 Functional Description

  – Multiple channels transmitting data simultaneously (programmable)
  – GDMA access supported by TX channel 3
- The receiver supports:
  – Normal RX mode
  – Wrap RX mode
  – RX filtering
  – Demodulation on RX pulses
  – GDMA access supported by RX channel 7

**Pin Assignment**

The pins for the remote control peripheral can be chosen from any GPIOs via the GPIO Matrix.

#### 4.2.2.18 Parallel IO Controller (PARLIO)

ESP32-P4 contains a Parallel IO controller (PARLIO) capable of transferring data between external devices and internal memory on a parallel bus through General Direct Memory Access (GDMA).

**Feature List**

- Various clock sources:
  – Including external IO clock PAD_CLK_TX/RX and internal system clock XTAL_CLK, PLL_F160M_CLK, and RC_FAST_CLK
  – Maximum IO clock frequency of 40 MHz
  – Integer and fractional clock frequency division
- 1/2/4/8/16-bit configurable data bus width
- Full-duplex communication with 16-bit data bus width
- Bit reversal when data bus width is 1/2/4-bit
- RX unit for receiving IO parallel data, which supports:
  – Output clock gating
  – RX unit input and output clock inverse
  – Various receive modes
  – Configurable GDMA SUC EOF generation
  – Configurable IO pin of external enable signal
- TX unit for sending IO parallel data, which supports:
  – Output clock gating
  – TX unit input and output clock inverse
  – Configurable TX EOF generation
<!-- PDF_PAGE_END 77 -->

<!-- PDF_PAGE_BEGIN 78 -->
## 4 Functional Description

  – Valid signal output
  – Configurable bus idle value

**Pin Assignment**

The pins for the parallel IO controller can be chosen from any GPIOs via the GPIO Matrix.

#### 4.2.2.19 BitScrambler

The ESP32-P4 has an extensive amount of DMA-capable peripherals. These can move data from memory to an external device, and vice versa, without any interference from the CPU. This only works if the external device needs or emits the data in question in the same format as the software expects it: if not, the CPU needs to rewrite the format of the data. Examples include a need to swap bytes, reverse bytes, and shift the data left or right.

Since bitwise operations can be relatively CPU-intensive and DMA is designed specifically to offload such work from the CPU, ESP32-P4 integrates two dedicated peripherals called BitScramblers. These modules are designed to transform data formats during transfers between memory and peripherals. One BitScrambler handles memory-to-peripheral (or memory-to-memory) transfers, while the other is dedicated to peripheral-to-memory transfers. While BitScramblers can handle the bitwise operations mentioned earlier, they are in fact flexible, programmable state machines capable of performing more advanced transformations as well.

**Feature List**

- Two BitScramblers, one for RX (peripheral-to-memory), one for TX (memory-to-peripheral)
- Support for memory-to-memory transfers
- Processing up to 32 bits per DMA clock period
- Data path controlled by a BitScrambler program stored in instruction memory
- Input registers able to read 0, 8, 16, or 32 bits per clock cycle
- Output registers:
  – Able to write 0, 8, 16, or 32 bits per clock cycle
  – Data sources for output register bits: 64 bits of input data, two counters, LUT RAM data, data output of last cycle, comparators
  – With some restrictions, each of the 32 output register bits can come from any bit on the data sources
- An 8 x 257-bit instruction memory for storing eight instructions, controlling control flow, and the data path
- 2048 bytes of lookup table (LUT) memory, configurable as various word widths

**Pin Assignment**

The BitScrambler does not directly interact with IOs, so it has no pins assigned.
<!-- PDF_PAGE_END 78 -->

<!-- PDF_PAGE_BEGIN 79 -->
## 4 Functional Description

### 4.2.3 Analog Signal Processing

This subsection describes components on the chip that sense and process real-world data.

#### 4.2.3.1 Touch Sensor

ESP32-P4 has 14 capacitive-sensing GPIOs, which detect variations induced by touching or approaching the GPIOs with a finger or other objects. The low-noise nature of the design and the high sensitivity of the circuit allow relatively small pads to be used. Arrays of pads can also be used, so that a larger area or more points can be detected. The touch sensing performance can be further enhanced by the waterproof design, detection of frequency hopping, and digital filtering feature.

**Feature List**

- Detection of 14 capacitive touch pins
- Sampling triggered by software or dedicated hardware timer
- Two sampling methods:
  – Pulses from the touch pins used as clock signals to count the sampling period
  – Pulses from the touch pins used as digital signals; sample the rising edge of the digital signal with the system clock to count the sampling period
- Scan mode, supporting sequential sampling of multiple touch pins by configuring the Touch FSM.
- Timeout mechanism to monitor channel abnormality
- Frequency hopping to increase the anti-interference of detection
- Proximity sensing mode with up to three configurable channels
- Configuration of individual touch sensors to operate normally in sleep mode
- Wake-up by touch sensor
- Moisture resistance
- Waterproof design

**Pin Assignment**

The pins of the touch sensor are multiplexed with GPIO2–GPIO15, LP_GPIO2–LP_GPIO15, LP_UART interface, and one four-line interface of SPI2. When the pins are configured for the analog function, the multiplexed digital functions are disabled.

#### 4.2.3.2 Temperature Sensor (TSENS)

ESP32-P4 provides a temperature sensor for real-time monitoring of temperature changes within the chip. The sensor converts analog voltage to digital values and provides compensation for temperature offsets.

**Feature List**

- Software-triggered temperature measurement, which once triggered, the sensor continuously measures temperature. Software can read the data at any time.
<!-- PDF_PAGE_END 79 -->

<!-- PDF_PAGE_BEGIN 80 -->
## 4 Functional Description

- Hardware-triggered automatic temperature monitoring, supporting two wake-up modes
- Configurable temperature offset based on the application scenario for improved accuracy
- Configurable temperature measurement range
- Support for Event Task Matrix (ETM)-related events and tasks

**Pin Assignment**

The temperature sensor does not directly interact with IOs, so it has no pins assigned.

#### 4.2.3.3 ADC Controller (ADC)

ESP32-P4 integrates two 12-bit successive approximation ADCs (SAR ADCs) for measuring analog signals from up to 14 pins.

**Feature List**

- HP ADC and LP ADC controllers can control the SAR ADC via software
- 12-bit resolution
- Analog input sampling from up to 14 pins
- HP ADC controllers:
  – Multi-channel sampling control module with configurable channel sampling sequence
  – Mode control module supporting dual HP ADC sampling
  – Two filters with configurable filter coefficients
  – Two threshold monitors that trigger an interrupt when filtered data exceeds a high threshold or falls below a low threshold
  – Continuous transfer of conversion results to memory via the GDMA interface
- LP ADC controllers:
  – One-shot sampling mode
  – Sampling in sleep mode (e.g., Deep-sleep)
- Event Task Matrix (ETM) support for various events and tasks

**Pin Assignment**

The pins of the ADC controller are multiplexed with GPIO16–GPIO23, GPIO49–GPIO54, the interfaces of two analog voltage comparators, and the third RMII interface of EMAC.

#### 4.2.3.4 Analog Voltage Comparator

ESP32-P4 integrates two analog voltage comparators. These comparators rely on special pads that support voltage comparison functionality to monitor voltage changes on these pads.
<!-- PDF_PAGE_END 80 -->

<!-- PDF_PAGE_BEGIN 81 -->
## 4 Functional Description

**Feature List**

- Voltage comparison
  – Configurable voltage comparison mode
  – Configurable reference voltage
- Interrupt upon changes of voltage comparison result
- ETM event generation

**Pin Assignment**

The pins of the analog voltage comparator are multiplexed with GPIO51–GPIO52, GPIO53–GPIO54, the interface of one ADC controller, and the third RMII interface of EMAC.

#### 4.2.3.5 Voice Activity Detection (VAD)

ESP32-P4 integrates a Voice Activity Detection (VAD) module. This module facilitates the hardware implementation of the first-stage algorithm for voice wake-up and other multimedia functions. Additionally, it provides hardware support for low-power voice wake-up solutions.

**Feature List**

- VAD algorithm processes voice data frame by frame, with each frame containing 256 data points. The data sampling rate is 8 kHz, and the bit width is 16 bits
- 2 KB buffer that stores up to four frames of data
- Independent system wake-up source
- Configurable interrupt sources
- Flexible configuration of algorithm parameters

**Pin Assignment**

The VAD module does not directly interact with IOs, so it has no pins assigned.
<!-- PDF_PAGE_END 81 -->

<!-- PDF_PAGE_BEGIN 82 -->
## 5 Electrical Characteristics

> **Note:**
> The values presented in this section are **preliminary** and may change with the final release of this datasheet.

### 5.1 Absolute Maximum Ratings

Stresses above those listed in Table 5-1 *Absolute Maximum Ratings* may cause permanent damage to the device. These are stress ratings only and normal operation of the device at these or any other conditions beyond those indicated in Section 5.2 Recommended Operating Conditions is not implied. Exposure to absolute-maximum-rated conditions for extended periods may affect device reliability.

**Table 5-1. Absolute Maximum Ratings**

<table>
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Description</th>
      <th>Min</th>
      <th>Max</th>
      <th>Unit</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>VDD_LDO, VDD_DCDCC, VDD_ANA, VDD_BAT, VDD_LP</td>
      <td>Allowed input voltage</td>
      <td>–0.3</td>
      <td>3.6</td>
      <td>V</td>
    </tr>
    <tr>
      <td>VDD_IO_0, VDD_FLASHIO<sup>3</sup>, VDD_IO_4, VDD_IO_5, VDD_IO_6</td>
      <td>Allowed input voltage</td>
      <td>–0.3</td>
      <td>3.6</td>
      <td>V</td>
    </tr>
    <tr>
      <td>VDD_PSRAM_0, VDD_PSRAM_1</td>
      <td>Allowed input voltage</td>
      <td>1.62</td>
      <td>1.98</td>
      <td>V</td>
    </tr>
    <tr>
      <td>VDD_HP_0, VDD_HP_1, VDD_HP_2, VDD_HP_3</td>
      <td>Allowed input voltage</td>
      <td>0</td>
      <td>1.3</td>
      <td>V</td>
    </tr>
    <tr>
      <td>VDD_MIPI_DPHY</td>
      <td>Allowed input voltage</td>
      <td>0</td>
      <td>2.75</td>
      <td>V</td>
    </tr>
    <tr>
      <td>VDD_USBPHY</td>
      <td>Allowed input voltage</td>
      <td>–0.66</td>
      <td>3.96</td>
      <td>V</td>
    </tr>
    <tr>
      <td>I<sub>output</sub><sup>2</sup></td>
      <td>Cumulative IO output current</td>
      <td>—</td>
      <td>1500</td>
      <td>mA</td>
    </tr>
    <tr>
      <td>T<sub>STORE</sub></td>
      <td>Storage temperature</td>
      <td>–40</td>
      <td>150</td>
      <td>°C</td>
    </tr>
  </tbody>
</table>

<sup>1</sup> For more information on input power pins, see Section 2.6.1 *Power Pins*.

<sup>2</sup> The product proved to be fully functional after all its IO pins were pulled high while being connected to ground for 24 consecutive hours at ambient temperature of 25 °C.

<sup>3</sup> VDD_FLASHIO provides power for flash IO, and the voltage should be adjusted according to the specific flash model.

### 5.2 Recommended Operating Conditions

**Table 5-2. Recommended Operating Conditions**

<table>
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Description</th>
      <th>Min</th>
      <th>Typ</th>
      <th>Max</th>
      <th>Unit</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>VDD_LDO, VDD_DCDCC, VDD_ANA, VDD_LP</td>
      <td>Recommended input voltage</td>
      <td>3.0</td>
      <td>3.3</td>
      <td>3.6</td>
      <td>V</td>
    </tr>
    <tr>
      <td>VDD_BAT</td>
      <td>Recommended input voltage</td>
      <td>2.5</td>
      <td>3.3</td>
      <td>3.6</td>
      <td>V</td>
    </tr>
    <tr>
      <td>VDD_IO_0, VDD_FLASHIO, VDD_IO_4, VDD_IO_5, VDD_IO_6</td>
      <td>Recommended input voltage</td>
      <td>1.65</td>
      <td>1.8</td>
      <td>3.6</td>
      <td>V</td>
    </tr>
    <tr>
      <td>VDD_PSRAM_0, VDD_PSRAM_1</td>
      <td>Recommended input voltage</td>
      <td>1.65</td>
      <td>1.8</td>
      <td>1.95</td>
      <td>V</td>
    </tr>
    <!-- PDF_PAGE_END 82 -->
    <!-- PDF_PAGE_BEGIN 83 -->
    <tr>
      <td>VDD_HP_0, VDD_HP_1, VDD_HP_2, VDD_HP_3 <sup>1</sup></td>
      <td>Recommended input voltage</td>
      <td>0.99</td>
      <td>1.1</td>
      <td>1.3</td>
      <td>V</td>
    </tr>
    <tr>
      <td>VDD_MIPI_DPHY</td>
      <td>Recommended input voltage</td>
      <td>2.25</td>
      <td>2.5</td>
      <td>2.75</td>
      <td>V</td>
    </tr>
    <tr>
      <td>VDD_USBPHY</td>
      <td>Recommended input voltage</td>
      <td>2.97</td>
      <td>3.3</td>
      <td>3.63</td>
      <td>V</td>
    </tr>
    <tr>
      <td>I<sub>VDD</sub></td>
      <td>Current supplied to core</td>
      <td>0.5</td>
      <td>—</td>
      <td>—</td>
      <td>A</td>
    </tr>
    <tr>
      <td>T<sub>A</sub></td>
      <td>Ambient temperature</td>
      <td>–40</td>
      <td>—</td>
      <td>85</td>
      <td>°C</td>
    </tr>
  </tbody>
</table>

<sup>1</sup> The chip can automatically adjust the input voltage of VDD_HP_x based on the situation.

### 5.3 VDDO_FLASH Output Characteristics

**Table 5-3. VDDO_FLASH Internal and Output Characteristics**

<table>
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Description</th>
      <th>Typ</th>
      <th>Unit</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>R<sub>VFB</sub></td>
      <td>VDDO_FLASH powered by VDD_LDO via R<sub>VFB</sub> for 3.3 V flash <sup>1</sup></td>
      <td>3</td>
      <td>Ω</td>
    </tr>
    <tr>
      <td>I<sub>VFB</sub></td>
      <td>Output current when VDDO_FLASH is powered by Flash Voltage Regulator for 1.8 V flash</td>
      <td>50</td>
      <td>mA</td>
    </tr>
  </tbody>
</table>

<sup>1</sup> See in conjunction with Section 2.6.2 *Power Scheme*.

<sup>1</sup> VDD_LDO must be more than *VDD_flash_min + I_flash_max* × R<sub>VFB</sub>;
where
- *VDD_flash_min* – minimum operating voltage of flash
- *I_flash_max* – maximum operating current of flash

### 5.4 DC Characteristics (3.3 V, 25 °C)

**Table 5-4. DC Characteristics (3.3 V, 25 °C)**

<table>
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Description</th>
      <th>Min</th>
      <th>Typ</th>
      <th>Max</th>
      <th>Unit</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>C<sub>IN</sub></td>
      <td>Pin capacitance</td>
      <td>—</td>
      <td>2</td>
      <td>—</td>
      <td>pF</td>
    </tr>
    <tr>
      <td>V<sub>IH</sub></td>
      <td>High-level input voltage</td>
      <td>0.75 × VDD<sup>1</sup></td>
      <td>—</td>
      <td>VDD<sup>1</sup> + 0.3</td>
      <td>V</td>
    </tr>
    <tr>
      <td>V<sub>IL</sub></td>
      <td>Low-level input voltage</td>
      <td>–0.3</td>
      <td>—</td>
      <td>0.25 × VDD<sup>1</sup></td>
      <td>V</td>
    </tr>
    <tr>
      <td>I<sub>IH</sub></td>
      <td>High-level input current</td>
      <td>—</td>
      <td>—</td>
      <td>50</td>
      <td>nA</td>
    </tr>
    <tr>
      <td>I<sub>IL</sub></td>
      <td>Low-level input current</td>
      <td>—</td>
      <td>—</td>
      <td>50</td>
      <td>nA</td>
    </tr>
    <tr>
      <td>V<sub>OH</sub><sup>2</sup></td>
      <td>High-level output voltage</td>
      <td>0.8 × VDD<sup>1</sup></td>
      <td>—</td>
      <td>—</td>
      <td>V</td>
    </tr>
    <tr>
      <td>V<sub>OL</sub><sup>2</sup></td>
      <td>Low-level output voltage</td>
      <td>—</td>
      <td>—</td>
      <td>0.1 × VDD<sup>1</sup></td>
      <td>V</td>
    </tr>
    <tr>
      <td>I<sub>OH</sub></td>
      <td>High-level source current (VDD<sup>1</sup> = 3.3 V, V<sub>OH</sub> >= 2.64 V, PAD_DRIVER = 3)</td>
      <td>—</td>
      <td>40</td>
      <td>—</td>
      <td>mA</td>
    </tr>
    <tr>
      <td>I<sub>OL</sub></td>
      <td>Low-level sink current (VDD<sup>1</sup> = 3.3 V, V<sub>OL</sub> = 0.495 V, PAD_DRIVER = 3)</td>
      <td>—</td>
      <td>28</td>
      <td>—</td>
      <td>mA</td>
    </tr>
    <tr>
      <td>R<sub>PU</sub></td>
      <td>Pull-up resistor</td>
      <td>—</td>
      <td>45</td>
      <td>—</td>
      <td>kΩ</td>
    </tr>
  </tbody>
</table>
<!-- PDF_PAGE_END 83 -->

<!-- PDF_PAGE_BEGIN 84 -->
## 5 Electrical Characteristics

<table>
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Description</th>
      <th>Min</th>
      <th>Typ</th>
      <th>Max</th>
      <th>Unit</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>R<sub>PD</sub></td>
      <td>Pull-down resistor</td>
      <td>—</td>
      <td>45</td>
      <td>—</td>
      <td>kΩ</td>
    </tr>
    <tr>
      <td>V<sub>IH_nRST</sub></td>
      <td>Chip reset release voltage (CHIP_PU should satisfy the required voltage)</td>
      <td>0.75 × VDD_BAT</td>
      <td>—</td>
      <td>VDD_BAT + 0.3</td>
      <td>V</td>
    </tr>
    <tr>
      <td>V<sub>IL_nRST</sub></td>
      <td>Chip reset voltage (CHIP_PU should satisfy the required voltage)</td>
      <td>–0.3</td>
      <td>—</td>
      <td>0.25 × VDD_BAT</td>
      <td>V</td>
    </tr>
  </tbody>
</table>

<sup>1</sup> VDD is the voltage for power pins VDD_IO_0/4/5/6.

<sup>2</sup> V<sub>OH</sub> and V<sub>OL</sub> are measured using high-impedance load.

### 5.5 ADC Characteristics

The measurements in this section are taken with an external 100 nF capacitor connected to the ADC, using DC signals as input, and at an ambient temperature of 25 °C.

**Table 5-5. ADC Characteristics**

<table>
  <thead>
    <tr>
      <th>Symbol</th>
      <th>Min</th>
      <th>Max</th>
      <th>Unit</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>DNL (Differential nonlinearity) <sup>1</sup></td>
      <td>–1</td>
      <td>3</td>
      <td>LSB</td>
    </tr>
    <tr>
      <td>INL (Integral nonlinearity)</td>
      <td>–5</td>
      <td>3</td>
      <td>LSB</td>
    </tr>
    <tr>
      <td>Sampling rate</td>
      <td>—</td>
      <td>100</td>
      <td>kSPS <sup>2</sup></td>
    </tr>
  </tbody>
</table>

<sup>1</sup> To get better DNL results, you can sample multiple times and apply a filter, or calculate the average value.

<sup>2</sup> kSPS means kilo samples-per-second.

The calibrated ADC results after hardware calibration and software calibration are shown in Table 5-6 *ADC Characteristics*. For higher accuracy, you may implement your own calibration methods.

**Table 5-6. ADC Calibration Results**

<table>
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Description</th>
      <th>Min</th>
      <th>Max</th>
      <th>Unit</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="4">Total error</td>
      <td>ATTEN0, effective measurement range of 0–1000</td>
      <td>–12</td>
      <td>12</td>
      <td>mV</td>
    </tr>
    <tr>
      <td>ATTEN1, effective measurement range of 0–1300</td>
      <td>–12</td>
      <td>12</td>
      <td>mV</td>
    </tr>
    <tr>
      <td>ATTEN2, effective measurement range of 0–1900</td>
      <td>–12</td>
      <td>12</td>
      <td>mV</td>
    </tr>
    <tr>
      <td>ATTEN3, effective measurement range of 0–3300</td>
      <td>–15</td>
      <td>15</td>
      <td>mV</td>
    </tr>
  </tbody>
</table>

### 5.6 Current Consumption in Active and Low-power Modes

The current consumption measurements in different modes are taken with a 3.3 V supply at 25 °C ambient temperature.

**Table 5-7. Current Consumption in Active Mode**

<table>
  <thead>
    <tr>
      <th>Work mode</th>
      <th>Frequency (MHz)</th>
      <th>Description</th>
      <th>Typ<sup>1</sup> (mA)</th>
      <th>Typ<sup>2</sup> (mA)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2"></td>
      <td rowspan="2">400</td>
      <td>WAITI (Dual core in idle state)</td>
      <td>23</td>
      <td>56</td>
    </tr>
    <tr>
      <td>Dual-core while(1) loop operation</td>
      <td>69</td>
      <td>112</td>
    </tr>
    <!-- PDF_PAGE_END 84 -->
    <!-- PDF_PAGE_BEGIN 85 -->
    <tr>
      <td></td>
      <td></td>
      <td>Single core running CoreMark instructions, the other core in idle state</td>
      <td>66</td>
      <td>110</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td>Dual core running 32-bit data access instructions</td>
      <td>97</td>
      <td>150</td>
    </tr>
    <tr>
      <td rowspan="4"></td>
      <td rowspan="4">200</td>
      <td>WAITI (Dual core in idle state)</td>
      <td>21</td>
      <td>54</td>
    </tr>
    <tr>
      <td>Dual-core while(1) loop operation</td>
      <td>44</td>
      <td>87</td>
    </tr>
    <tr>
      <td>Single core running CoreMark instructions, the other core in idle state</td>
      <td>43</td>
      <td>86</td>
    </tr>
    <tr>
      <td>Dual core running 32-bit data access instructions</td>
      <td>58</td>
      <td>100</td>
    </tr>
    <tr>
      <td rowspan="4"></td>
      <td rowspan="4">100</td>
      <td>WAITI (Dual core in idle state)</td>
      <td>17</td>
      <td>40</td>
    </tr>
    <tr>
      <td>Dual-core while(1) loop operation</td>
      <td>29</td>
      <td>56</td>
    </tr>
    <tr>
      <td>Single core running CoreMark instructions, the other core in idle state</td>
      <td>29</td>
      <td>55</td>
    </tr>
    <tr>
      <td>Dual core running 32-bit data access instructions</td>
      <td>36</td>
      <td>63</td>
    </tr>
    <tr>
      <td rowspan="4"></td>
      <td rowspan="4">40</td>
      <td>WAITI (Dual core in idle state)</td>
      <td>15</td>
      <td>30</td>
    </tr>
    <tr>
      <td>Dual-core while(1) loop operation</td>
      <td>19</td>
      <td>37</td>
    </tr>
    <tr>
      <td>Single core running CoreMark instructions, the other core in idle state</td>
      <td>19</td>
      <td>37</td>
    </tr>
    <tr>
      <td>Dual core running 32-bit data access instructions</td>
      <td>22</td>
      <td>39</td>
    </tr>
  </tbody>
</table>

<sup>1</sup> Current consumption when all peripheral clocks are **disabled**.

<sup>2</sup> Current consumption when all peripheral clocks are **enabled**. In practice, the current consumption might be different depending on which peripherals are enabled.

<sup>3</sup> In Active mode, the current consumption might be higher when accessing flash/PSRAM.

**Table 5-8. Current Consumption in Low-Power Modes**

<table>
  <thead>
    <tr>
      <th>Mode</th>
      <th>Description</th>
      <th>Typ (mA)<sup>1</sup></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="3">Light-sleep<sup>2</sup></td>
      <td>All GPIOs are high-impedance, and all power supplies are enabled</td>
      <td>0.8</td>
    </tr>
    <tr>
      <td>All GPIOs are high-impedance, most of peripherals are disabled, and chip is connected through USB</td>
      <td>0.085</td>
    </tr>
    <tr>
      <td>All peripherals are disabled, and data is stored in HP memory</td>
      <td>0.075</td>
    </tr>
    <tr>
      <td>Deep-sleep</td>
      <td>LP timer and LP memory are powered on</td>
      <td>0.012</td>
    </tr>
    <tr>
      <td>Power off</td>
      <td>CHIP_PU is set to low level, the chip is powered off</td>
      <td>0.001</td>
    </tr>
  </tbody>
</table>

<sup>1</sup> The power consumption data was measured with USB 2.0 not working.

<sup>2</sup> The current in Light-sleep mode refers to the current measured when the PSRAM is not powered. In Light-sleep mode, if the PSRAM is powered on, the chip's internal current increases by about 0.1 mA, in addition to the current required for the PSRAM's operating mode.

### 5.7 Memory Specifications

The data below is sourced from the memory vendor datasheet. These values are guaranteed through design and/or characterization but are not fully tested in production. Devices are shipped with the memory
<!-- PDF_PAGE_END 85 -->

<!-- PDF_PAGE_BEGIN 86 -->
## 5 Electrical Characteristics

erased.

**Table 5-9. Flash Specifications**

<table>
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Description</th>
      <th>Min</th>
      <th>Typ</th>
      <th>Max</th>
      <th>Unit</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2">VCC</td>
      <td>Power supply voltage (1.8 V)</td>
      <td>1.65</td>
      <td>1.80</td>
      <td>2.00</td>
      <td>V</td>
    </tr>
    <tr>
      <td>Power supply voltage (3.3 V)</td>
      <td>2.7</td>
      <td>3.3</td>
      <td>3.6</td>
      <td>V</td>
    </tr>
    <tr>
      <td>F<sub>C</sub></td>
      <td>Maximum clock frequency</td>
      <td>80</td>
      <td>—</td>
      <td>—</td>
      <td>MHz</td>
    </tr>
    <tr>
      <td>—</td>
      <td>Program/erase cycles</td>
      <td>100,000</td>
      <td>—</td>
      <td>—</td>
      <td>cycles</td>
    </tr>
    <tr>
      <td>T<sub>RET</sub></td>
      <td>Data retention time</td>
      <td>20</td>
      <td>—</td>
      <td>—</td>
      <td>years</td>
    </tr>
    <tr>
      <td>T<sub>PP</sub></td>
      <td>Page program time</td>
      <td>—</td>
      <td>0.8</td>
      <td>5</td>
      <td>ms</td>
    </tr>
    <tr>
      <td>T<sub>SE</sub></td>
      <td>Sector erase time (4 KB)</td>
      <td>—</td>
      <td>70</td>
      <td>500</td>
      <td>ms</td>
    </tr>
    <tr>
      <td>T<sub>BE1</sub></td>
      <td>Block erase time (32 KB)</td>
      <td>—</td>
      <td>0.2</td>
      <td>2</td>
      <td>s</td>
    </tr>
    <tr>
      <td>T<sub>BE2</sub></td>
      <td>Block erase time (64 KB)</td>
      <td>—</td>
      <td>0.3</td>
      <td>3</td>
      <td>s</td>
    </tr>
    <tr>
      <td rowspan="5">T<sub>CE</sub></td>
      <td>Chip erase time (16 Mb)</td>
      <td>—</td>
      <td>7</td>
      <td>20</td>
      <td>s</td>
    </tr>
    <tr>
      <td>Chip erase time (32 Mb)</td>
      <td>—</td>
      <td>20</td>
      <td>60</td>
      <td>s</td>
    </tr>
    <tr>
      <td>Chip erase time (64 Mb)</td>
      <td>—</td>
      <td>25</td>
      <td>100</td>
      <td>s</td>
    </tr>
    <tr>
      <td>Chip erase time (128 Mb)</td>
      <td>—</td>
      <td>60</td>
      <td>200</td>
      <td>s</td>
    </tr>
    <tr>
      <td>Chip erase time (256 Mb)</td>
      <td>—</td>
      <td>70</td>
      <td>300</td>
      <td>s</td>
    </tr>
  </tbody>
</table>

**Table 5-10. PSRAM Specifications**

<table>
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Description</th>
      <th>Min</th>
      <th>Typ</th>
      <th>Max</th>
      <th>Unit</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2">VCC</td>
      <td>Power supply voltage (1.8 V)</td>
      <td>1.62</td>
      <td>1.80</td>
      <td>1.98</td>
      <td>V</td>
    </tr>
    <tr>
      <td>Power supply voltage (3.3 V)</td>
      <td>2.7</td>
      <td>3.3</td>
      <td>3.6</td>
      <td>V</td>
    </tr>
    <tr>
      <td>F<sub>C</sub></td>
      <td>Maximum clock frequency</td>
      <td>80</td>
      <td>—</td>
      <td>—</td>
      <td>MHz</td>
    </tr>
  </tbody>
</table>
<!-- PDF_PAGE_END 86 -->

<!-- PDF_PAGE_BEGIN 87 -->
## 6 Packaging

- For information about tape, reel, and chip marking, please refer to *ESP32-P4 Chip Packaging Information*.
- The pins of the chip are numbered in anti-clockwise order starting from Pin 1 in the top view. For pin numbers and pin names, see also Figure 2-1 *ESP32-P4 Pin Layout (Top View)*.

<!-- IMAGE_BEGIN -->
<!-- IMAGE_RECT 0.05,0.18,0.95,0.78 -->
**Figure 6-1. QFN104 (10×10 mm) Package**

![Figure 6-1. QFN104 (10×10 mm) Package](esp32-p4-datasheet.images/img_p087_01.png)
<!-- IMAGE_AI_GENERATED_DESCRIPTION_BEGIN -->
> The figure shows the mechanical package drawing of the QFN104 (10×10 mm) package for the ESP32-P4 chip. The drawing comprises four views: a top view, a side view, a bottom view, and a dimension table.
>
> **Top view (upper-left):** A square outline labeled with "PIN 1 CORNER" at the top-left, with the pin numbered "104" near it and "1" inside marking Pin 1 location with a dot. Datum references "A" (top), "B" (bottom), and "C" (right) are shown along the edges. Geometric tolerance flags are present at the top edge.
>
> **Side view (upper-right):** Shows the side profile of the package with seating plane indicated. Dimensions A2, A1, and (A3) are labeled, indicating total thickness, stand-off, and L/F thickness respectively. A geometric tolerance reference C and seating plane symbol are shown.
>
> **Bottom view (lower-left):** Shows the QFN package with 104 leads (pins) arranged around the perimeter. Labels include "8X (L1)" and "96X L" for lead lengths, "D2" and "E2" for the exposed die attach pad dimensions, "EXPOSED DIE ATTACH PAD" labeled inside, "PIN 1 I.D." marking, "104X b" for lead width count, and "96X (K)" for lead-tip-to-pad-edge dimension. Pin numbers 1, 26, 27, 52, 53, 78, 79, 104 are marked at the corners.
>
> **Dimension table (lower-right):**
> | SYMBOL | MIN | NOM | MAX |
> |---|---|---|---|
> | TOTAL THICKNESS A | 0.8 | 0.85 | 0.9 |
> | STAND OFF A1 | 0 | 0.02 | 0.05 |
> | MOLD THICKNESS A2 | --- | 0.65 | --- |
> | L/F THICKNESS A3 | | 0.203 REF | |
> | LEAD WIDTH b | 0.13 | 0.18 | 0.23 |
> | BODY SIZE D (X) | | 10 BSC | |
> | BODY SIZE E (Y) | | 10 BSC | |
> | LEAD PITCH e | | 0.35 BSC | |
> | EP SIZE D2 (X) | 7.4 | 7.5 | 7.6 |
> | EP SIZE E2 (Y) | 7.4 | 7.5 | 7.6 |
> | LEAD LENGTH L | 0.3 | 0.4 | 0.5 |
> | LEAD LENGTH L1 | | 0.35 REF | |
> | LEAD TIP TO EXPOSED PAD EDGE K | | 0.85 REF | |
> | PACKAGE EDGE TOLERANCE aaa | | 0.1 | |
> | MOLD FLATNESS ccc | | 0.1 | |
> | COPLANARITY eee | | 0.08 | |
> | LEAD OFFSET bbb | | 0.07 | |
> | EXPOSED PAD OFFSET fff | | 0.1 | |
>
> **Notes:**
> 1. REFER TO JEDEC MO-220;
> 2. COPLANARITY APPLIES TO LEADS, CORNER LEADS AND DIE ATTACH PAD;
> 3. BAN TO USE THE LEVEL 1 ENVIRONMENT-RELATED SUBSTANCES;
> 4. FINISH: Cu/EP - SnB-20s
<!-- IMAGE_AI_GENERATED_DESCRIPTION_END -->
<!-- IMAGE_END -->
<!-- PDF_PAGE_END 87 -->

<!-- PDF_PAGE_BEGIN 88 -->
## Related Documentation and Resources

### Related Documentation

- ESP32-P4 Technical Reference Manual – Detailed information on how to use the ESP32-P4 memory and peripherals.
- ESP32-P4 Hardware Design Guidelines – Guidelines on how to integrate the ESP32-P4 into your hardware product.
- ESP32-P4 Series SoC Errata – Descriptions of known errors in ESP32-P4 series of SoCs.
- *Certificates*
  https://espressif.com/en/support/documents/certificates
- *ESP32-P4 Product/Process Change Notifications (PCN)*
  https://espressif.com/en/support/documents/pcns?keys=ESP32-P4
- *ESP32-P4 Advisories* – Information on security, bugs, compatibility, component reliability.
  https://espressif.com/en/support/documents/advisories?keys=ESP32-P4
- *Documentation Updates and Update Notification Subscription*
  https://espressif.com/en/support/download/documents

### Developer Zone

- ESP-IDF Programming Guide for ESP32-P4 – Extensive documentation for the ESP-IDF development framework.
- *ESP-IDF* and other development frameworks on GitHub.
  https://github.com/espressif
- *ESP32 BBS Forum* – Engineer-to-Engineer (E2E) Community for Espressif products where you can post questions, share knowledge, explore ideas, and help solve problems with fellow engineers.
  https://esp32.com/
- *ESP-FAQ* – A summary document of frequently asked questions released by Espressif.
  https://espressif.com/projects/esp-faq/en/latest/index.html
- *The ESP Journal* – Best Practices, Articles, and Notes from Espressif folks.
  https://blog.espressif.com/
- See the tabs *SDKs and Demos*, *Apps*, *Tools*, *AT Firmware*.
  https://espressif.com/en/support/download/sdks-demos

### Products

- *ESP32-P4 Series SoCs* – Browse through all ESP32-P4 SoCs.
  https://espressif.com/en/products/socs?id=ESP32-P4
- *ESP32-P4 Series DevKits* – Browse through all ESP32-P4-based devkits.
  https://espressif.com/en/products/devkits?id=ESP32-P4
- *ESP Product Selector* – Find an Espressif hardware product suitable for your needs by comparing or applying filters.
  https://products.espressif.com/#/product-selector?language=en

### Contact Us

- See the tabs *Sales Questions*, *Technical Enquiries*, *Circuit Schematic & PCB Design Review*, *Get Samples* (Online stores), *Become Our Supplier*, *Comments & Suggestions*.
  https://espressif.com/en/contact-us/sales-questions
<!-- PDF_PAGE_END 88 -->

<!-- PDF_PAGE_BEGIN 89 -->
## Appendix A – ESP32-P4 Consolidated Pin Overview

You can download the Excel file for the ESP32-P4 Consolidated Pin Overview table below.

<table>
  <thead>
    <tr>
      <th rowspan="2">Pin No.</th>
      <th rowspan="2">Pin Name</th>
      <th rowspan="2">Pin Type</th>
      <th rowspan="2">Pin Providing Power</th>
      <th colspan="2">Pin Settings</th>
      <th colspan="8">HP IO MUX Function</th>
      <th colspan="4">LP IO MUX Function</th>
      <th colspan="2">Analog Function</th>
    </tr>
    <tr>
      <th>At Reset</th>
      <th>After Reset</th>
      <th>F0</th>
      <th>Type</th>
      <th>F1</th>
      <th>Type</th>
      <th>F2</th>
      <th>Type</th>
      <th>F3</th>
      <th>Type</th>
      <th>F0</th>
      <th>Type</th>
      <th>F1</th>
      <th>Type</th>
      <th>F0</th>
      <th>F1</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>GPIO1</td>
      <td>IO</td>
      <td>VDD_LP/VDD_BAT</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO1</td>
      <td>I/O/T</td>
      <td>GPIO1</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>LP_GPIO1</td>
      <td>I/O/T</td>
      <td>LP_GPIO1</td>
      <td>I/O/T</td>
      <td>XTAL_32K_P</td>
      <td>–</td>
    </tr>
    <tr>
      <td>2</td>
      <td>GPIO2</td>
      <td>IO</td>
      <td>VDD_LP/VDD_BAT</td>
      <td>–</td>
      <td>IE, WPU</td>
      <td>MTCK</td>
      <td>I1</td>
      <td>GPIO2</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>LP_GPIO2</td>
      <td>I/O/T</td>
      <td>LP_GPIO2</td>
      <td>I/O/T</td>
      <td>TOUCH_CHANNEL1</td>
      <td>–</td>
    </tr>
    <tr>
      <td>3</td>
      <td>GPIO3</td>
      <td>IO</td>
      <td>VDD_LP/VDD_BAT</td>
      <td>–</td>
      <td>IE</td>
      <td>MTDI</td>
      <td>I1</td>
      <td>GPIO3</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>LP_GPIO3</td>
      <td>I/O/T</td>
      <td>LP_GPIO3</td>
      <td>I/O/T</td>
      <td>TOUCH_CHANNEL2</td>
      <td>–</td>
    </tr>
    <tr>
      <td>4</td>
      <td>GPIO4</td>
      <td>IO</td>
      <td>VDD_LP</td>
      <td>–</td>
      <td>IE</td>
      <td>MTMS</td>
      <td>I0</td>
      <td>GPIO4</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>LP_GPIO4</td>
      <td>I/O/T</td>
      <td>LP_GPIO4</td>
      <td>I/O/T</td>
      <td>TOUCH_CHANNEL3</td>
      <td>–</td>
    </tr>
    <tr>
      <td>5</td>
      <td>GPIO5</td>
      <td>IO</td>
      <td>VDD_LP</td>
      <td>–</td>
      <td>–</td>
      <td>MTDO</td>
      <td>O/T</td>
      <td>GPIO5</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>LP_GPIO5</td>
      <td>I/O/T</td>
      <td>LP_GPIO5</td>
      <td>I/O/T</td>
      <td>TOUCH_CHANNEL4</td>
      <td>–</td>
    </tr>
    <tr>
      <td>6</td>
      <td>GPIO6</td>
      <td>IO</td>
      <td>VDD_LP</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO6</td>
      <td>I/O/T</td>
      <td>GPIO6</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>SPI2_HOLD_PAD</td>
      <td>I1/O/T</td>
      <td>LP_GPIO6</td>
      <td>I/O/T</td>
      <td>LP_GPIO6</td>
      <td>I/O/T</td>
      <td>TOUCH_CHANNEL5</td>
      <td>–</td>
    </tr>
    <tr>
      <td>7</td>
      <td>GPIO7</td>
      <td>IO</td>
      <td>VDD_LP</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO7</td>
      <td>I/O/T</td>
      <td>GPIO7</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>SPI2_CS_PAD</td>
      <td>I1/O/T</td>
      <td>LP_GPIO7</td>
      <td>I/O/T</td>
      <td>LP_GPIO7</td>
      <td>I/O/T</td>
      <td>TOUCH_CHANNEL6</td>
      <td>–</td>
    </tr>
    <tr>
      <td>8</td>
      <td>GPIO8</td>
      <td>IO</td>
      <td>VDD_LP</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO8</td>
      <td>I/O/T</td>
      <td>GPIO8</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>SPI2_D_PAD</td>
      <td>I1/O/T</td>
      <td>LP_GPIO8</td>
      <td>I/O/T</td>
      <td>LP_GPIO8</td>
      <td>I/O/T</td>
      <td>TOUCH_CHANNEL7</td>
      <td>–</td>
    </tr>
    <tr>
      <td>9</td>
      <td>VDD_LP</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>10</td>
      <td>GPIO9</td>
      <td>IO</td>
      <td>VDD_LP</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO9</td>
      <td>I/O/T</td>
      <td>GPIO9</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>SPI2_CK_PAD</td>
      <td>I1/O/T</td>
      <td>LP_GPIO9</td>
      <td>I/O/T</td>
      <td>LP_GPIO9</td>
      <td>I/O/T</td>
      <td>TOUCH_CHANNEL8</td>
      <td>–</td>
    </tr>
    <tr>
      <td>11</td>
      <td>GPIO10</td>
      <td>IO</td>
      <td>VDD_LP</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO10</td>
      <td>I/O/T</td>
      <td>GPIO10</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>SPI2_Q_PAD</td>
      <td>I1/O/T</td>
      <td>LP_GPIO10</td>
      <td>I/O/T</td>
      <td>LP_GPIO10</td>
      <td>I/O/T</td>
      <td>TOUCH_CHANNEL9</td>
      <td>–</td>
    </tr>
    <tr>
      <td>12</td>
      <td>GPIO11</td>
      <td>IO</td>
      <td>VDD_LP</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO11</td>
      <td>I/O/T</td>
      <td>GPIO11</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>SPI2_WP_PAD</td>
      <td>I1/O/T</td>
      <td>LP_GPIO11</td>
      <td>I/O/T</td>
      <td>LP_GPIO11</td>
      <td>I/O/T</td>
      <td>TOUCH_CHANNEL10</td>
      <td>–</td>
    </tr>
    <tr>
      <td>13</td>
      <td>GPIO12</td>
      <td>IO</td>
      <td>VDD_LP</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO12</td>
      <td>I/O/T</td>
      <td>GPIO12</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>LP_GPIO12</td>
      <td>I/O/T</td>
      <td>LP_GPIO12</td>
      <td>I/O/T</td>
      <td>TOUCH_CHANNEL11</td>
      <td>–</td>
    </tr>
    <tr>
      <td>14</td>
      <td>GPIO13</td>
      <td>IO</td>
      <td>VDD_LP</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO13</td>
      <td>I/O/T</td>
      <td>GPIO13</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>LP_GPIO13</td>
      <td>I/O/T</td>
      <td>LP_GPIO13</td>
      <td>I/O/T</td>
      <td>TOUCH_CHANNEL12</td>
      <td>–</td>
    </tr>
    <tr>
      <td>15</td>
      <td>GPIO14</td>
      <td>IO</td>
      <td>VDD_LP</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO14</td>
      <td>I/O/T</td>
      <td>GPIO14</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>LP_UART_TXD_PAD</td>
      <td>O</td>
      <td>LP_GPIO14</td>
      <td>I/O/T</td>
      <td>TOUCH_CHANNEL13</td>
      <td>–</td>
    </tr>
    <tr>
      <td>16</td>
      <td>GPIO15</td>
      <td>IO</td>
      <td>VDD_LP</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO15</td>
      <td>I/O/T</td>
      <td>GPIO15</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>LP_UART_RXD_PAD</td>
      <td>I1</td>
      <td>LP_GPIO15</td>
      <td>I/O/T</td>
      <td>TOUCH_CHANNEL14</td>
      <td>–</td>
    </tr>
    <tr>
      <td>17</td>
      <td>GPIO16</td>
      <td>IO</td>
      <td>VDD_IO_0</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO16</td>
      <td>I/O/T</td>
      <td>GPIO16</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>ADC1_CHANNEL0</td>
      <td>–</td>
    </tr>
    <tr>
      <td>18</td>
      <td>GPIO17</td>
      <td>IO</td>
      <td>VDD_IO_0</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO17</td>
      <td>I/O/T</td>
      <td>GPIO17</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>ADC1_CHANNEL1</td>
      <td>–</td>
    </tr>
    <tr>
      <td>19</td>
      <td>GPIO18</td>
      <td>IO</td>
      <td>VDD_IO_0</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO18</td>
      <td>I/O/T</td>
      <td>GPIO18</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>ADC1_CHANNEL2</td>
      <td>–</td>
    </tr>
    <tr>
      <td>20</td>
      <td>GPIO19</td>
      <td>IO</td>
      <td>VDD_IO_0</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO19</td>
      <td>I/O/T</td>
      <td>GPIO19</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>ADC1_CHANNEL3</td>
      <td>–</td>
    </tr>
    <tr>
      <td>21</td>
      <td>VDD_IO_0</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>22</td>
      <td>GPIO20</td>
      <td>IO</td>
      <td>VDD_IO_0</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO20</td>
      <td>I/O/T</td>
      <td>GPIO20</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>ADC1_CHANNEL4</td>
      <td>–</td>
    </tr>
    <tr>
      <td>23</td>
      <td>GPIO21</td>
      <td>IO</td>
      <td>VDD_IO_0</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO21</td>
      <td>I/O/T</td>
      <td>GPIO21</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>ADC1_CHANNEL5</td>
      <td>–</td>
    </tr>
    <tr>
      <td>24</td>
      <td>GPIO22</td>
      <td>IO</td>
      <td>VDD_IO_0</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO22</td>
      <td>I/O/T</td>
      <td>GPIO22</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>ADC1_CHANNEL6</td>
      <td>–</td>
    </tr>
    <tr>
      <td>25</td>
      <td>GPIO23</td>
      <td>IO</td>
      <td>VDD_IO_0</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO23</td>
      <td>I/O/T</td>
      <td>GPIO23</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>REF_50M_CLK_PAD</td>
      <td>O</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>ADC1_CHANNEL7</td>
      <td>–</td>
    </tr>
    <tr>
      <td>26</td>
      <td>VDD_HP_0</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>27</td>
      <td>FLASH_CS</td>
      <td>Dedicated Output</td>
      <td>VDD_FLASHIO</td>
      <td>–</td>
      <td>–</td>
      <td>FLASH_CS</td>
      <td>O</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>28</td>
      <td>FLASH_Q</td>
      <td>Dedicated IO</td>
      <td>VDD_FLASHIO</td>
      <td>–</td>
      <td>–</td>
      <td>FLASH_Q</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>29</td>
      <td>FLASH_WP</td>
      <td>Dedicated IO</td>
      <td>VDD_FLASHIO</td>
      <td>–</td>
      <td>–</td>
      <td>FLASH_WP</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>30</td>
      <td>VDD_FLASHIO</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>31</td>
      <td>FLASH_HOLD</td>
      <td>Dedicated IO</td>
      <td>VDD_FLASHIO</td>
      <td>–</td>
      <td>–</td>
      <td>FLASH_HOLD</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>32</td>
      <td>FLASH_CK</td>
      <td>Dedicated Output</td>
      <td>VDD_FLASHIO</td>
      <td>–</td>
      <td>–</td>
      <td>FLASH_CK</td>
      <td>O</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>33</td>
      <td>FLASH_D</td>
      <td>Dedicated IO</td>
      <td>VDD_FLASHIO</td>
      <td>–</td>
      <td>–</td>
      <td>FLASH_D</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>34</td>
      <td>DSI_REXT</td>
      <td>Dedicated IO</td>
      <td>VDD_MIPI_DPHY</td>
      <td>–</td>
      <td>–</td>
      <td>MIPI DSI PHY 4.02 KΩ EXTERNAL RESISTOR</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>35</td>
      <td>DSI_DATAP1</td>
      <td>Dedicated IO</td>
      <td>VDD_MIPI_DPHY</td>
      <td>–</td>
      <td>–</td>
      <td>MIPI DSI PHY DATAP1</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>36</td>
      <td>DSI_DATAN1</td>
      <td>Dedicated IO</td>
      <td>VDD_MIPI_DPHY</td>
      <td>–</td>
      <td>–</td>
      <td>MIPI DSI PHY DATAN1</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>37</td>
      <td>DSI_CLKN</td>
      <td>Dedicated IO</td>
      <td>VDD_MIPI_DPHY</td>
      <td>–</td>
      <td>–</td>
      <td>MIPI DSI PHY CLKN</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>38</td>
      <td>DSI_CLKP</td>
      <td>Dedicated IO</td>
      <td>VDD_MIPI_DPHY</td>
      <td>–</td>
      <td>–</td>
      <td>MIPI DSI PHY CLKP</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>39</td>
      <td>DSI_DATAP0</td>
      <td>Dedicated IO</td>
      <td>VDD_MIPI_DPHY</td>
      <td>–</td>
      <td>–</td>
      <td>MIPI DSI PHY DATAP0</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>40</td>
      <td>DSI_DATAN0</td>
      <td>Dedicated IO</td>
      <td>VDD_MIPI_DPHY</td>
      <td>–</td>
      <td>–</td>
      <td>MIPI DSI PHY DATAN0</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>41</td>
      <td>VDD_MIPI_DPHY</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>42</td>
      <td>CSI_DATAN0</td>
      <td>Dedicated IO</td>
      <td>VDD_MIPI_DPHY</td>
      <td>–</td>
      <td>–</td>
      <td>MIPI CSI PHY DATAN0</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <!-- PDF_PAGE_END 89 -->
    <!-- PDF_PAGE_BEGIN 90 -->
    <tr>
      <td>43</td>
      <td>CSI_DATAP0</td>
      <td>Dedicated IO</td>
      <td>VDD_MIPI_DPHY</td>
      <td>–</td>
      <td>–</td>
      <td>MIPI CSI PHY DATAP0</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>44</td>
      <td>CSI_CLKP</td>
      <td>Dedicated IO</td>
      <td>VDD_MIPI_DPHY</td>
      <td>–</td>
      <td>–</td>
      <td>MIPI CSI PHY CLKP</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>45</td>
      <td>CSI_CLKN</td>
      <td>Dedicated IO</td>
      <td>VDD_MIPI_DPHY</td>
      <td>–</td>
      <td>–</td>
      <td>MIPI CSI PHY CLKN</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>46</td>
      <td>CSI_DATAN1</td>
      <td>Dedicated IO</td>
      <td>VDD_MIPI_DPHY</td>
      <td>–</td>
      <td>–</td>
      <td>MIPI CSI PHY DATAN1</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>47</td>
      <td>CSI_DATAP1</td>
      <td>Dedicated IO</td>
      <td>VDD_MIPI_DPHY</td>
      <td>–</td>
      <td>–</td>
      <td>MIPI CSI PHY DATAP1</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>48</td>
      <td>CSI_REXT</td>
      <td>Dedicated IO</td>
      <td>VDD_MIPI_DPHY</td>
      <td>–</td>
      <td>–</td>
      <td>MIPI CSI PHY 4.02 KΩ EXTERNAL RESISTOR</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>49</td>
      <td>DM</td>
      <td>Dedicated IO</td>
      <td>VDD_USBPHY</td>
      <td>–</td>
      <td>–</td>
      <td>USB2 OTG PHY DM</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>50</td>
      <td>DP</td>
      <td>Dedicated IO</td>
      <td>VDD_USBPHY</td>
      <td>–</td>
      <td>–</td>
      <td>USB2 OTG PHY DP</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>51</td>
      <td>VDD_USBPHY</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>52</td>
      <td>GPIO24</td>
      <td>IO</td>
      <td>VDD_IO_4</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO24</td>
      <td>I/O/T</td>
      <td>GPIO24</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>USB1P1_N0</td>
      <td>–</td>
    </tr>
    <tr>
      <td>53</td>
      <td>GPIO25</td>
      <td>IO</td>
      <td>VDD_IO_4</td>
      <td>–</td>
      <td>IE, USB_WPU</td>
      <td>GPIO25</td>
      <td>I/O/T</td>
      <td>GPIO25</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>USB1P1_P0</td>
      <td>–</td>
    </tr>
    <tr>
      <td>54</td>
      <td>VDD_HP_1</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>55</td>
      <td>GPIO26</td>
      <td>IO</td>
      <td>VDD_IO_4</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO26</td>
      <td>I/O/T</td>
      <td>GPIO26</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>USB1P1_N1</td>
      <td>–</td>
    </tr>
    <tr>
      <td>56</td>
      <td>GPIO27</td>
      <td>IO</td>
      <td>VDD_IO_4</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO27</td>
      <td>I/O/T</td>
      <td>GPIO27</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>USB1P1_P1</td>
      <td>–</td>
    </tr>
    <tr>
      <td>57</td>
      <td>GPIO28</td>
      <td>IO</td>
      <td>VDD_IO_4</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO28</td>
      <td>I/O/T</td>
      <td>GPIO28</td>
      <td>I/O/T</td>
      <td>SPI2_CS_PAD</td>
      <td>I1/O/T</td>
      <td>GMAC_PHY_RXDV_PAD</td>
      <td>I0</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>58</td>
      <td>GPIO29</td>
      <td>IO</td>
      <td>VDD_IO_4</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO29</td>
      <td>I/O/T</td>
      <td>GPIO29</td>
      <td>I/O/T</td>
      <td>SPI2_D_PAD</td>
      <td>I1/O/T</td>
      <td>GMAC_PHY_RXD0_PAD</td>
      <td>I0</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>59</td>
      <td>VDD_PSRAM_0</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>60</td>
      <td>GPIO30</td>
      <td>IO</td>
      <td>VDD_IO_4</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO30</td>
      <td>I/O/T</td>
      <td>GPIO30</td>
      <td>I/O/T</td>
      <td>SPI2_CK_PAD</td>
      <td>I1/O/T</td>
      <td>GMAC_PHY_RXD1_PAD</td>
      <td>I0</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>61</td>
      <td>GPIO31</td>
      <td>IO</td>
      <td>VDD_IO_4</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO31</td>
      <td>I/O/T</td>
      <td>GPIO31</td>
      <td>I/O/T</td>
      <td>SPI2_Q_PAD</td>
      <td>I1/O/T</td>
      <td>GMAC_PHY_RXER_PAD</td>
      <td>I0</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>62</td>
      <td>VDD_IO_4</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>63</td>
      <td>GPIO32</td>
      <td>IO</td>
      <td>VDD_IO_4</td>
      <td>IE</td>
      <td>–</td>
      <td>GPIO32</td>
      <td>I/O/T</td>
      <td>GPIO32</td>
      <td>I/O/T</td>
      <td>SPI2_HOLD_PAD</td>
      <td>I1/O/T</td>
      <td>GMAC_RMII_CLK_PAD</td>
      <td>I0</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>64</td>
      <td>GPIO33</td>
      <td>IO</td>
      <td>VDD_IO_4</td>
      <td>IE</td>
      <td>–</td>
      <td>GPIO33</td>
      <td>I/O/T</td>
      <td>GPIO33</td>
      <td>I/O/T</td>
      <td>SPI2_WP_PAD</td>
      <td>I1/O/T</td>
      <td>GMAC_PHY_TXEN_PAD</td>
      <td>O</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>65</td>
      <td>GPIO34</td>
      <td>IO</td>
      <td>VDD_IO_4</td>
      <td>IE</td>
      <td>–</td>
      <td>GPIO34</td>
      <td>I/O/T</td>
      <td>GPIO34</td>
      <td>I/O/T</td>
      <td>SPI2_IO4_PAD</td>
      <td>I1/O/T</td>
      <td>GMAC_PHY_TXD0_PAD</td>
      <td>O</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>66</td>
      <td>GPIO35</td>
      <td>IO</td>
      <td>VDD_IO_4</td>
      <td>IE, WPU</td>
      <td>–</td>
      <td>GPIO35</td>
      <td>I/O/T</td>
      <td>GPIO35</td>
      <td>I/O/T</td>
      <td>SPI2_IO5_PAD</td>
      <td>I1/O/T</td>
      <td>GMAC_PHY_TXD1_PAD</td>
      <td>O</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>67</td>
      <td>VDD_PSRAM_1</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>68</td>
      <td>GPIO36</td>
      <td>IO</td>
      <td>VDD_IO_4</td>
      <td>IE</td>
      <td>–</td>
      <td>GPIO36</td>
      <td>I/O/T</td>
      <td>GPIO36</td>
      <td>I/O/T</td>
      <td>SPI2_IO6_PAD</td>
      <td>I1/O/T</td>
      <td>GMAC_PHY_TXER_PAD</td>
      <td>O</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>69</td>
      <td>GPIO37</td>
      <td>IO</td>
      <td>VDD_IO_4</td>
      <td>IE</td>
      <td>IE</td>
      <td>UART0_TXD_PAD</td>
      <td>O</td>
      <td>GPIO37</td>
      <td>I/O/T</td>
      <td>SPI2_IO7_PAD</td>
      <td>I1/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>70</td>
      <td>GPIO38</td>
      <td>IO</td>
      <td>VDD_IO_4</td>
      <td>IE</td>
      <td>–</td>
      <td>UART0_RXD_PAD</td>
      <td>I1</td>
      <td>GPIO38</td>
      <td>I/O/T</td>
      <td>SPI2_DQS_PAD</td>
      <td>O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>71</td>
      <td>VDDO_FLASH</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>72</td>
      <td>VDDO_PSRAM</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>73</td>
      <td>VDDO_3</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>74</td>
      <td>VDDO_4</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>75</td>
      <td>VDD_LDO</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>76</td>
      <td>VDD_HP_2</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>77</td>
      <td>VDD_DCDCC</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>78</td>
      <td>FB_DCDC</td>
      <td>Analog</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>79</td>
      <td>EN_DCDC</td>
      <td>Analog</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>80</td>
      <td>GPIO39</td>
      <td>IO</td>
      <td>VDD_IO_5</td>
      <td>–</td>
      <td>–</td>
      <td>SD1_CDATA0_PAD</td>
      <td>I1/O/T</td>
      <td>GPIO39</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>REF_50M_CLK_PAD</td>
      <td>O</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>81</td>
      <td>GPIO40</td>
      <td>IO</td>
      <td>VDD_IO_5</td>
      <td>–</td>
      <td>–</td>
      <td>SD1_CDATA1_PAD</td>
      <td>I1/O/T</td>
      <td>GPIO40</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>GMAC_PHY_TXEN_PAD</td>
      <td>O</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>82</td>
      <td>GPIO41</td>
      <td>IO</td>
      <td>VDD_IO_5</td>
      <td>–</td>
      <td>–</td>
      <td>SD1_CDATA2_PAD</td>
      <td>I1/O/T</td>
      <td>GPIO41</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>GMAC_PHY_TXD0_PAD</td>
      <td>O</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>83</td>
      <td>GPIO42</td>
      <td>IO</td>
      <td>VDD_IO_5</td>
      <td>–</td>
      <td>–</td>
      <td>SD1_CDATA3_PAD</td>
      <td>I1/O/T</td>
      <td>GPIO42</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>GMAC_PHY_TXD1_PAD</td>
      <td>O</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>84</td>
      <td>GPIO43</td>
      <td>IO</td>
      <td>VDD_IO_5</td>
      <td>–</td>
      <td>–</td>
      <td>SD1_CCLK_PAD</td>
      <td>O</td>
      <td>GPIO43</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>GMAC_PHY_TXER_PAD</td>
      <td>O</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>85</td>
      <td>VDD_IO_5</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>86</td>
      <td>GPIO44</td>
      <td>IO</td>
      <td>VDD_IO_5</td>
      <td>–</td>
      <td>–</td>
      <td>SD1_CCMD_PAD</td>
      <td>I1/O/T</td>
      <td>GPIO44</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>GMAC_RMII_CLK_PAD</td>
      <td>I0</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>87</td>
      <td>GPIO45</td>
      <td>IO</td>
      <td>VDD_IO_5</td>
      <td>–</td>
      <td>–</td>
      <td>SD1_CDATA4_PAD</td>
      <td>I1/O/T</td>
      <td>GPIO45</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>GMAC_PHY_RXDV_PAD</td>
      <td>I0</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>88</td>
      <td>GPIO46</td>
      <td>IO</td>
      <td>VDD_IO_5</td>
      <td>–</td>
      <td>–</td>
      <td>SD1_CDATA5_PAD</td>
      <td>I1/O/T</td>
      <td>GPIO46</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>GMAC_PHY_RXD0_PAD</td>
      <td>I0</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>89</td>
      <td>GPIO47</td>
      <td>IO</td>
      <td>VDD_IO_5</td>
      <td>–</td>
      <td>–</td>
      <td>SD1_CDATA6_PAD</td>
      <td>I1/O/T</td>
      <td>GPIO47</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>GMAC_PHY_RXD1_PAD</td>
      <td>I0</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>90</td>
      <td>GPIO48</td>
      <td>IO</td>
      <td>VDD_IO_5</td>
      <td>–</td>
      <td>–</td>
      <td>SD1_CDATA7_PAD</td>
      <td>I1/O/T</td>
      <td>GPIO48</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>GMAC_PHY_RXER_PAD</td>
      <td>I0</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>91</td>
      <td>VDD_HP_3</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>92</td>
      <td>GPIO49</td>
      <td>IO</td>
      <td>VDD_IO_6</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO49</td>
      <td>I/O/T</td>
      <td>GPIO49</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>GMAC_PHY_TXEN_PAD</td>
      <td>O</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>ADC2_CHANNEL0</td>
      <td>–</td>
    </tr>
    <tr>
      <td>93</td>
      <td>GPIO50</td>
      <td>IO</td>
      <td>VDD_IO_6</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO50</td>
      <td>I/O/T</td>
      <td>GPIO50</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>GMAC_RMII_CLK_PAD</td>
      <td>I0</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>ADC2_CHANNEL1</td>
      <td>–</td>
    </tr>
    <!-- PDF_PAGE_END 90 -->
    <!-- PDF_PAGE_BEGIN 91 -->
    <tr>
      <td>94</td>
      <td>GPIO51</td>
      <td>IO</td>
      <td>VDD_IO_6</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO51</td>
      <td>I/O/T</td>
      <td>GPIO51</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>GMAC_PHY_RXDV_PAD</td>
      <td>I0</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>ADC2_CHANNEL2</td>
      <td>ANA_COMP0</td>
    </tr>
    <tr>
      <td>95</td>
      <td>GPIO52</td>
      <td>IO</td>
      <td>VDD_IO_6</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO52</td>
      <td>I/O/T</td>
      <td>GPIO52</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>GMAC_PHY_RXD0_PAD</td>
      <td>I0</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>ADC2_CHANNEL3</td>
      <td>ANA_COMP0</td>
    </tr>
    <tr>
      <td>96</td>
      <td>VDD_IO_6</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>97</td>
      <td>GPIO53</td>
      <td>IO</td>
      <td>VDD_IO_6</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO53</td>
      <td>I/O/T</td>
      <td>GPIO53</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>GMAC_PHY_RXD1_PAD</td>
      <td>I0</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>ADC2_CHANNEL4</td>
      <td>ANA_COMP1</td>
    </tr>
    <tr>
      <td>98</td>
      <td>GPIO54</td>
      <td>IO</td>
      <td>VDD_IO_6</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO54</td>
      <td>I/O/T</td>
      <td>GPIO54</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>GMAC_PHY_RXER_PAD</td>
      <td>I0</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>ADC2_CHANNEL5</td>
      <td>ANA_COMP1</td>
    </tr>
    <tr>
      <td>99</td>
      <td>XTAL_N</td>
      <td>Analog</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>100</td>
      <td>XTAL_P</td>
      <td>Analog</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>101</td>
      <td>VDD_ANA</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>102</td>
      <td>VDD_BAT</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>103</td>
      <td>CHIP_PU</td>
      <td>Analog</td>
      <td>VDD_BAT</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>104</td>
      <td>GPIO0</td>
      <td>IO</td>
      <td>VDD_LP/VDD_BAT</td>
      <td>–</td>
      <td>–</td>
      <td>GPIO0</td>
      <td>I/O/T</td>
      <td>GPIO0</td>
      <td>I/O/T</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>LP_GPIO0</td>
      <td>I/O/T</td>
      <td>LP_GPIO0</td>
      <td>I/O/T</td>
      <td>XTAL_32K_N</td>
      <td>–</td>
    </tr>
    <tr>
      <td>105</td>
      <td>GND</td>
      <td>Power</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    </tr>
  </tbody>
</table>

<sub>*</sub> For details, see Section 2 *Pins*. Regarding highlighted cells, see Section 2.3.4 *Restrictions for GPIOs and LP GPIOs*.
<!-- PDF_PAGE_END 91 -->

<!-- PDF_PAGE_BEGIN 92 -->
## Revision History

<table>
  <thead>
    <tr>
      <th>Date</th>
      <th>Version</th>
      <th>Release notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>2026-04-23</td>
      <td>v0.6</td>
      <td> <ul> <li>Updated Chip Revision in Table 1-1 <em>Comparison</em> from v3.0/v3.1 to v3.x</li> <li>Updated the Pin Type in Table 2-1 <em>Pin Overview</em> and Appendix A – ESP32-P4 Consolidated Pin Overview: the original "Dedicated" type is now refined into "Dedicated Input", "Dedicated Output", or "Dedicated IO"</li> <li>Updated descriptions about VO3 LDO and VO4 LDO in Table 2-12 <em>Voltage Regulators</em></li> <li>Added descriptions about PSRAM in Section 4.1.3.1 <em>System and Memory</em></li> <li>Corrected the maximum frequency of the I2S configurable APLL clock source in 4.2.2.6 <em>I2S Controller (I2S)</em> to 125 MHz</li> <li>Updated the values for VDD_IO_0, VDD_FLASHIO, VDD_IO_4, VDD_IO_5, VDD_IO_6 in Table 5-1 <em>Absolute Maximum Ratings</em> and Table 5-2 <em>Recommended Operating Conditions</em></li> </ul> </td>
    </tr>
    <tr>
      <td>2026-03-11</td>
      <td>v0.5</td>
      <td>Preliminary release for ESP32-P4 chip revision v3.1</td>
    </tr>
  </tbody>
</table>
<!-- PDF_PAGE_END 92 -->

<!-- PDF_PAGE_BEGIN 93 -->
## Disclaimer and Copyright Notice

Information in this document, including URL references, is subject to change without notice.

ALL THIRD PARTY'S INFORMATION IN THIS DOCUMENT IS PROVIDED AS IS WITH NO WARRANTIES TO ITS AUTHENTICITY AND ACCURACY.

NO WARRANTY IS PROVIDED TO THIS DOCUMENT FOR ITS MERCHANTABILITY, NON-INFRINGEMENT, FITNESS FOR ANY PARTICULAR PURPOSE, NOR DOES ANY WARRANTY OTHERWISE ARISING OUT OF ANY PROPOSAL, SPECIFICATION OR SAMPLE.

All liability, including liability for infringement of any proprietary rights, relating to use of information in this document is disclaimed. No licenses express or implied, by estoppel or otherwise, to any intellectual property rights are granted herein.

The Wi-Fi Alliance Member logo is a trademark of the Wi-Fi Alliance. The Bluetooth logo is a registered trademark of Bluetooth SIG.

All trade names, trademarks and registered trademarks mentioned in this document are property of their respective owners, and are hereby acknowledged.

Copyright © 2026 Espressif Systems (Shanghai) Co., Ltd. All rights reserved.

www.espressif.com
<!-- PDF_PAGE_END 93 -->
