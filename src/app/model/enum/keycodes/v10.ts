
export enum EKeycodeV10 {
  _QK_MODS= 0x0100,
  _QK_MODS_MAX= 0x1fff,
  _QK_MOD_TAP= 0x6000,
  _QK_MOD_TAP_MAX= 0x7fff,
  _QK_LAYER_TAP= 0x4000,
  _QK_LAYER_TAP_MAX= 0x4fff,
  _QK_LAYER_MOD= 0x5900,
  _QK_LAYER_MOD_MAX= 0x59ff,
  _QK_TO= 0x5000,
  _QK_TO_MAX= 0x501f,
  _QK_MOMENTARY= 0x5100,
  _QK_MOMENTARY_MAX= 0x511f,
  _QK_DEF_LAYER= 0x5200,
  _QK_DEF_LAYER_MAX= 0x521f,
  _QK_TOGGLE_LAYER= 0x5300,
  _QK_TOGGLE_LAYER_MAX= 0x531f,
  _QK_ONE_SHOT_LAYER= 0x5400,
  _QK_ONE_SHOT_LAYER_MAX= 0x541f,
  _QK_ONE_SHOT_MOD= 0x5500,
  _QK_ONE_SHOT_MOD_MAX= 0x55ff,
  _QK_LAYER_TAP_TOGGLE= 0x5800,
  _QK_LAYER_TAP_TOGGLE_MAX= 0x581f,
  _QK_LAYER_MOD_MASK= 0x0f,
  _QK_MACRO= 0x5f12,
  _QK_MACRO_MAX= 0x5f21,
  _QK_KB= 0x5f80,
  _QK_KB_MAX= 0x5f8f,
  QK_MAGIC_TOGGLE_GUI=0x700b,
  KC_NO= 0x0000,
  KC_TRNS= 0x0001,
  KC_A= 0x0004,
  KC_B= 0x0005,
  KC_C= 0x0006,
  KC_D= 0x0007,
  KC_E= 0x0008,
  KC_F= 0x0009,
  KC_G= 0x000a,
  KC_H= 0x000b,
  KC_I= 0x000c,
  KC_J= 0x000d,
  KC_K= 0x000e,
  KC_L= 0x000f,
  KC_M= 0x0010,
  KC_N= 0x0011,
  KC_O= 0x0012,
  KC_P= 0x0013,
  KC_Q= 0x0014,
  KC_R= 0x0015,
  KC_S= 0x0016,
  KC_T= 0x0017,
  KC_U= 0x0018,
  KC_V= 0x0019,
  KC_W= 0x001a,
  KC_X= 0x001b,
  KC_Y= 0x001c,
  KC_Z= 0x001d,
  KC_1= 0x001e,
  KC_2= 0x001f,
  KC_3= 0x0020,
  KC_4= 0x0021,
  KC_5= 0x0022,
  KC_6= 0x0023,
  KC_7= 0x0024,
  KC_8= 0x0025,
  KC_9= 0x0026,
  KC_0= 0x0027,
  KC_ENT= 0x0028,
  KC_ESC= 0x0029,
  KC_BSPC= 0x002a,
  KC_TAB= 0x002b,
  KC_SPC= 0x002c,
  KC_MINS= 0x002d,
  KC_EQL= 0x002e,
  KC_LBRC= 0x002f,
  KC_RBRC= 0x0030,
  KC_BSLS= 0x0031,
  KC_NUHS= 0x0032,
  KC_SCLN= 0x0033,
  KC_QUOT= 0x0034,
  KC_GRV= 0x0035,
  KC_COMM= 0x0036,
  KC_DOT= 0x0037,
  KC_SLSH= 0x0038,
  KC_CAPS= 0x0039,
  KC_F1= 0x003a,
  KC_F2= 0x003b,
  KC_F3= 0x003c,
  KC_F4= 0x003d,
  KC_F5= 0x003e,
  KC_F6= 0x003f,
  KC_F7= 0x0040,
  KC_F8= 0x0041,
  KC_F9= 0x0042,
  KC_F10= 0x0043,
  KC_F11= 0x0044,
  KC_F12= 0x0045,
  KC_PSCR= 0x0046,
  KC_SLCK= 0x0047,
  KC_PAUS= 0x0048,
  KC_INS= 0x0049,
  KC_HOME= 0x004a,
  KC_PGUP= 0x004b,
  KC_DEL= 0x004c,
  KC_END= 0x004d,
  KC_PGDN= 0x004e,
  KC_RGHT= 0x004f,
  KC_LEFT= 0x0050,
  KC_DOWN= 0x0051,
  KC_UP= 0x0052,
  KC_NLCK= 0x0053,
  KC_PSLS= 0x0054,
  KC_PAST= 0x0055,
  KC_PMNS= 0x0056,
  KC_PPLS= 0x0057,
  KC_PENT= 0x0058,
  KC_P1= 0x0059,
  KC_P2= 0x005a,
  KC_P3= 0x005b,
  KC_P4= 0x005c,
  KC_P5= 0x005d,
  KC_P6= 0x005e,
  KC_P7= 0x005f,
  KC_P8= 0x0060,
  KC_P9= 0x0061,
  KC_P0= 0x0062,
  KC_PDOT= 0x0063,
  KC_NUBS= 0x0064,
  KC_APP= 0x0065,
  KC_POWER= 0x0066,
  KC_PEQL= 0x0067,
  KC_F13= 0x0068,
  KC_F14= 0x0069,
  KC_F15= 0x006a,
  KC_F16= 0x006b,
  KC_F17= 0x006c,
  KC_F18= 0x006d,
  KC_F19= 0x006e,
  KC_F20= 0x006f,
  KC_F21= 0x0070,
  KC_F22= 0x0071,
  KC_F23= 0x0072,
  KC_F24= 0x0073,
  KC_EXECUTE= 0x0074,
  KC_HELP= 0x0075,
  KC_MENU= 0x0076,
  KC_SELECT= 0x0077,
  KC_STOP= 0x0078,
  KC_AGAIN= 0x0079,
  KC_UNDO= 0x007a,
  KC_CUT= 0x007b,
  KC_COPY= 0x007c,
  KC_PASTE= 0x007d,
  KC_FIND= 0x007e,
  KC_LCAP= 0x0082,
  KC_LNUM= 0x0083,
  KC_LSCR= 0x0084,
  KC_PCMM= 0x0085,
  KC_KP_EQUAL_AS400= 0x0086,
  KC_RO= 0x0087,
  KC_KANA= 0x0088,
  KC_JYEN= 0x0089,
  KC_HENK= 0x008a,
  KC_MHEN= 0x008b,
  KC_INT6= 0x008c,
  KC_INT7= 0x008d,
  KC_INT8= 0x008e,
  KC_INT9= 0x008f,
  KC_HAEN= 0x0090,
  KC_HANJ= 0x0091,
  KC_LANG3= 0x0092,
  KC_LANG4= 0x0093,
  KC_LANG5= 0x0094,
  KC_LANG6= 0x0095,
  KC_LANG7= 0x0096,
  KC_LANG8= 0x0097,
  KC_LANG9= 0x0098,
  KC_ERAS= 0x0099,
  KC_SYSREQ= 0x009a,
  KC_CANCEL= 0x009b,
  KC_CLR= 0x009c,
  KC_CLEAR= 0x009c,
  KC_PRIOR= 0x009d,
  KC_OUT= 0x00a0,
  KC_OPER= 0x00a1,
  KC_CLEAR_AGAIN= 0x00a2,
  KC_CRSEL= 0x00a3,
  KC_EXSEL= 0x00a4,
  KC_PWR= 0x00a5,
  KC_SLEP= 0x00a6,
  KC_WAKE= 0x00a7,
  KC_MUTE= 0x00a8,
  KC_VOLU= 0x00a9,
  KC_VOLD= 0x00aa,
  KC_MNXT= 0x00ab,
  KC_MPRV= 0x00ac,
  KC_MSTP= 0x00ad,
  KC_MPLY= 0x00ae,
  KC_MSEL= 0x00af,
  KC_EJCT= 0x00b0,
  KC_MAIL= 0x00b1,
  KC_CALC= 0x00b2,
  KC_MYCM= 0x00b3,
  KC_WWW_SEARCH= 0x00b4,
  KC_WWW_HOME= 0x00b5,
  KC_WWW_BACK= 0x00b6,
  KC_WWW_FORWARD= 0x00b7,
  KC_WWW_STOP= 0x00b8,
  KC_WWW_REFRESH= 0x00b9,
  KC_WWW_FAVORITES= 0x00ba,
  KC_MFFD= 0x00bb,
  KC_MRWD= 0x00bc,
  KC_BRIU= 0x00bd,
  KC_BRID= 0x00be,
  KC_LCTL= 0x00e0,
  KC_LSFT= 0x00e1,
  KC_LALT= 0x00e2,
  KC_LGUI= 0x00e3,
  KC_RCTL= 0x00e4,
  KC_RSFT= 0x00e5,
  KC_RALT= 0x00e6,
  KC_RGUI= 0x00e7,
  KC_MS_UP= 0x00f0,
  KC_MS_DOWN= 0x00f1,
  KC_MS_LEFT= 0x00f2,
  KC_MS_RIGHT= 0x00f3,
  KC_MS_BTN1= 0x00f4,
  KC_MS_BTN2= 0x00f5,
  KC_MS_BTN3= 0x00f6,
  KC_MS_BTN4= 0x00f7,
  KC_MS_BTN5= 0x00f8,
  KC_MS_WH_UP= 0x00f9,
  KC_MS_WH_DOWN= 0x00fa,
  KC_MS_WH_LEFT= 0x00fb,
  KC_MS_WH_RIGHT= 0x00fc,
  KC_MS_ACCEL0= 0x00fd,
  KC_MS_ACCEL1= 0x00fe,
  KC_MS_ACCEL2= 0x00ff,
  RESET= 0x5c00,
  DEBUG= 0x5c01,
  MAGIC_TOGGLE_NKRO= 0x5c14,
  KC_GESC= 0x5c16,
  AU_ON= 0x5c1d,
  AU_OFF= 0x5c1e,
  AU_TOG= 0x5c1f,
  CLICKY_TOGGLE= 0x5c20,
  CLICKY_ENABLE= 0x5c21,
  CLICKY_DISABLE= 0x5c22,
  CLICKY_UP= 0x5c23,
  CLICKY_DOWN= 0x5c24,
  CLICKY_RESET= 0x5c25,
  MU_ON= 0x5c26,
  MU_OFF= 0x5c27,
  MU_TOG= 0x5c28,
  MU_MOD= 0x5c29,
  BL_ON= 0x5cbb,
  BL_OFF= 0x5cbc,
  BL_DEC= 0x5cbd,
  BL_INC= 0x5cbe,
  BL_TOGG= 0x5cbf,
  BL_STEP= 0x5cc0,
  BL_BRTG= 0x5cc1,
  RGB_TOG= 0x5cc2,
  RGB_MOD= 0x5cc3,
  RGB_RMOD= 0x5cc4,
  RGB_HUI= 0x5cc5,
  RGB_HUD= 0x5cc6,
  RGB_SAI= 0x5cc7,
  RGB_SAD= 0x5cc8,
  RGB_VAI= 0x5cc9,
  RGB_VAD= 0x5cca,
  RGB_SPI= 0x5ccb,
  RGB_SPD= 0x5ccc,
  RGB_M_P= 0x5ccd,
  RGB_M_B= 0x5cce,
  RGB_M_R= 0x5ccf,
  RGB_M_SW= 0x5cd0,
  RGB_M_SN= 0x5cd1,
  RGB_M_K= 0x5cd2,
  RGB_M_X= 0x5cd3,
  RGB_M_G= 0x5cd4,
  KC_LSPO= 0x5cd7,
  KC_RSPC= 0x5cd8,
  KC_SFTENT= 0x5cd9,
  KC_LCPO= 0x5cf3,
  KC_RCPC= 0x5cf4,
  KC_LAPO= 0x5cf5,
  KC_RAPC= 0x5cf6,
  BR_INC= 0x5f00,
  BR_DEC= 0x5f01,
  EF_INC= 0x5f02,
  EF_DEC= 0x5f03,
  ES_INC= 0x5f04,
  ES_DEC= 0x5f05,
  H1_INC= 0x5f06,
  H1_DEC= 0x5f07,
  S1_INC= 0x5f08,
  S1_DEC= 0x5f09,
  H2_INC= 0x5f0a,
  H2_DEC= 0x5f0b,
  S2_INC= 0x5f0c,
  S2_DEC= 0x5f0d,
  FN_MO13= 0x5f10,
  FN_MO23= 0x5f11,
  KC_LPAD=0xc2,
  KC_MIC=0xc1
};
