'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { StickyNote, Plus, Tag, Group, Wand2, Undo2, Redo2, X, Menu, MoreHorizontal, Check, Settings, ExternalLink, LayersPlus, Search, Trash2, CircleEllipsis, Download, Upload, FolderOpen, FolderDown, ChevronUp, ChevronDown, Copy } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { useStore, RoomData, Dossier } from '@/store/useStore';
import { v4 as uuidv4 } from 'uuid';

// ── Emoji helpers ─────────────────────────────────────────────────────────────
const EMOJI_GROUPS = [
  {
    title: "Smileys",
    emojis: [
      '😀','😁','😂','🤣','😃','😄','😅','😆','😇','😉','😊','😋','😌','😍','😎','😏',
      '😐','😑','😒','😓','😔','😕','😗','😘','😙','😚','😛','😜','😝','😞','😟','😠',
      '😡','😢','😣','😤','😥','😦','😧','😨','😩','😪','😫','😬','😭','😮','😯','😰',
      '😱','😲','😳','😴','😵','😶','😷','🙁','🙂','🙃','🙄',
      '🤐','🤑','🤒','🤓','🤔','🤕','🤗','🤠','🤡','🤢','🤤','🤥','🤧','🤨','🤩','🤪',
      '🤫','🤬','🤭','🤮','🤯','🥰','🥱','🥲','🥳','🥴','🥵','🥶','🥸','🥹','🥺',
      '🫠','🫢','🫣','🫤','🫨','😈','👿','💀','☠️','👻','👹','👺','💩','🫥',
    ]
  },
  {
    title: "People",
    emojis: [
      '👶','👧','👦','🧒','👩','👨','🧑','👱','👴','👵','🧔','🧕','👲',
      '🎅','🤶','🧑‍🎄','🧑‍🍼','🧑‍🎓','🧑‍🏫','🧑‍⚕️','🧑‍🍳','🧑‍🌾','🧑‍🔧','🧑‍🏭','🧑‍💼','🧑‍🔬','🧑‍🎨','🧑‍✈️','🧑‍🚀','🧑‍🚒',
      '👮','💂','🕵️','👷','🫂','🧏','🙆','🙅','💁','🙋','🤦','🤷',
      '🥷','🦹','🦸','🧛','🧙','🧟','🫅','🧝','🧞','🧜','🧚','🧌',
      '👍','👎','🫰','👏','🙌','🤝','🙏','✌️','👌','🤞','🫶','🤟','🤘',
      '✊','🤜','🤛','🫱','🫲','🫳','🫴','🖐️','✋','🫡','🤙','☝️','👆','👇','👈','👉',
      '👀','🧠','💪','🦾','🦵','🦶','👂','🦻','👃','🫀','🫁','🦷','🦴','👁️','👅','🦲',
    ]
  },
  {
    title: "Places",
    emojis: [
      '🏠','🏡','🏢','🏣','🏤','🏦','🏧','🏨','🏩','🏪','🏫','🏬','🏭','🏗️',
      '🏰','🏯','🏛️','🕌','🛕','🕍','⛩️','🕋','💒','🗼','🗽','🗿',
      '🏟️','🏖️','🏜️','🛖','🏘️','🏚️',
      '🌃','🌆','🌇','🏙️','🌁','🌉','⛲',
      '🛋️','🛏️','🚿','🛁','🪑','🚪','🪞','🪟',
      '🎠','🎡','🎢',
    ]
  },
  {
    title: "Productivity",
    emojis: [
      '💼','📝','📌','📍','📎','🖇️','🔧','⚙️','🛠️','💡','🔑','🗝️',
      '📚','📖','📊','📈','📉','📋','🗂️','📁','📂','📦','📬','📮','📯',
      '✏️','🖊️','🖋️','📐','📏','✂️','🔒','🔓','🪝','🪤',
      '📅','📆','🗓️','⏰','⏱️','⏲️','⌛','⏳',
      '📧','📨','📩','📤','📥','💬','💭','🗯️','📢','📣','🔔','🔕',
      '📓','📔','📒','📕','📗','📘','📙','📃','📄','📑','🗒️','📜',
      '🖥️','🖨️','⌨️','🖱️','💾','💿','📀','📼',
    ]
  },
  {
    title: "Technology",
    emojis: [
      '💻','📱','📲','☎️','📞','📟','📠',
      '📺','📻','🎙️','📷','📸','📹','🎥','📡','🛰️',
      '🤖','👾','🔭','🧬','🔬','🧪','🧫',
      '🔌','🔋','🪫','🖲️','🧲','🛡️','🔐','🔏','🗜️',
    ]
  },
  {
    title: "Entertainment",
    emojis: [
      '🎨','🖼️','🎭','🎬','📽️','🎞️','🎤','🎧',
      '🎵','🎶','🎼','🎸','🎹','🎷','🎺','🥁','🎻','🪕','🪘','🪗','🪈',
      '🎟️','🎫','🎰','🎲','🃏','🀄','🎴','♟️','🧩','🎳',
      '🎉','🎊','🎈','🎁','🎀','🎗️','🎆','🎇','🧨',
      '🎋','🎍','🎎','🎏','🎐','🎑','🪆','🪅','🪩',
      '🎮','🕹️',
    ]
  },
  {
    title: "Shopping",
    emojis: [
      '💄','💋','💅','💍','⌚','👗','👘','👙','🩱','🩲','🩳',
      '👠','👡','👢','🥿','👞','👟','🧢','👒','🎩','🪖','👔','🧥',
      '🧣','🧤','🧦','👛','👜','🛍️','🎒','🏷️',
      '💰','💵','💴','💶','💷','💸','💳','🪙','💹','💎',
      '🧴','🧼','🪥','🧹','🧺','🧻','🪣','🧽','🪒',
    ]
  },
  {
    title: "Travel",
    emojis: [
      '✈️','🛫','🛬','🚂','🚃','🚄','🚅','🚆','🚇','🚈','🚉','🚊','🚋','🚌','🚍',
      '🚗','🚕','🚙','🚐','🚑','🚒','🚓','🚔','🚖','🚘','🏎️','🚜','🚚','🚛','🛻',
      '🚲','🛴','🏍️','🛵','🚁','🛸','🚀','⛵','🚤','🛥️','🛳️','⛴️','🚢','🛶',
      '🚠','🚡','🚞','🚝','🪂',
      '⛽','🛞','🚦','🚥','🚧','🗺️','🧳','🛂','🛃','🛄','🛅',
    ]
  },
  {
    title: "Animals",
    emojis: [
      '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵',
      '🙈','🙉','🙊','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄',
      '🐝','🐛','🦋','🐌','🐞','🐜','🪲','🦟','🦗','🕷️','🦂',
      '🦎','🐍','🐢','🐊','🦕','🦖','🦔','🐉','🐲',
      '🦧','🦣','🦛','🦏','🦍','🐘','🦒','🦓','🦬','🐃','🐂','🐄',
      '🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐕‍🦺','🐈','🐈‍⬛',
      '🪶','🦃','🦤','🦚','🦜','🦢','🦩','🕊️','🐇','🦝','🦨','🦡','🦦','🦥','🐁','🐀',
      '🐿️','🦈','🐬','🐳','🐋','🐟','🐠','🐡','🦐','🦞','🦀','🦑','🐙',
    ]
  },
  {
    title: "Nature",
    emojis: [
      '🌿','🌱','🌲','🌳','🌴','🍀','🍁','🍂','🍃','🪴','🌵','🎄','🌾',
      '🌸','🌺','🌻','🌹','🥀','🪷','🌷','💐','🌼','🍄','🌰','🪺',
      '🏔️','🏝️','⛰️','🌋','🗻','🏞️',
      '☀️','🌤️','⛅','🌥️','☁️','🌦️','🌧️','⛈️','🌩️','🌨️','❄️','☃️','⛄','🌬️','💨',
      '🌪️','🌫️','🌈','⚡','🔥','💧','🌊',
      '🌙','🌛','🌜','🌝','🌚','⭐','🌟','💫','✨','☄️','🌠','🪐','🌌','🌍','🌎','🌏',
    ]
  },
  {
    title: "Food & Drink",
    emojis: [
      '🍎','🍊','🍋','🍌','🍍','🥭','🍑','🍒','🍓','🫐','🥝','🍅','🫒','🍇','🍈','🍉',
      '🥥','🥑','🍆','🥔','🥕','🌽','🌶️','🫑','🥒','🥬','🧄','🧅','🫘','🥜',
      '🍞','🥐','🥖','🫓','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🌭',
      '🍔','🍟','🍕','🫔','🌮','🌯','🥙','🧆','🍱','🍘','🍙','🍚','🍛','🍜','🍝',
      '🍠','🍢','🍣','🍤','🍥','🥮','🍡','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪',
      '☕','🍵','🫖','🧃','🥤','🧋','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🍾','🫗',
      '🧂','🫙','🫚','🍯','🥫','🧊',
    ]
  },
  {
    title: "Activities",
    emojis: [
      '⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🏓','🏸','🏒','🏑','🥍',
      '🏏','🥅','⛳',
      '🥊','🥋','🤺','🤼','🤸','⛹️','🤾','🏇','🧘','🏋️','🚴','🏊','🏄','🤽','🚣',
      '🧗','⛷️','🏂','🛷','⛸️','🎿','🛼','🤿','🎣','🏹','🪃','🪀','🪁',
      '🏆','🥇','🥈','🥉','🏅','🎖️','🏵️','🎯',
      '🏕️','⛺','🎪',
    ]
  },
  {
    title: "Health",
    emojis: [
      '🏥','💊','💉','🩺','🩻','🩹','🩼','🩸',
      '💆','💇','🧖','🛌','🛀','🏃','🚶','🧎','🧍',
      '💤',
    ]
  },
  {
    title: "Objects",
    emojis: [
      '🏮','🪔','🔦','🕯️',
      '🔨','⚒️','⛏️','🔩','🪛','🔗','🧰','🪜','🧱',
      '🔮','🧿','🪬','🪄','🎃',
      '⚔️','🗡️',
      '🧸',
      '👑',
      '🧧',
    ]
  },
  {
    title: "Symbols",
    emojis: [
      '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','♥️',
      '✅','❌','⭕','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤',
      '🔶','🔷','🔸','🔹','🔺','🔻','💠','🔘','🔲','🔳',
      '♻️','✔️','➕','➖','➗','✖️','💯','‼️','⁉️','❓','❔','❕','❗',
      '⬆️','⬇️','⬅️','➡️','↗️','↘️','↙️','↖️','↕️','↔️','🔁','🔂','🔃','🔄',
      '🅰️','🅱️','🆎','🆑','🆒','🆓','🆔','🆕','🆖','🆗','🆘','🆙','🆚',
      '🔠','🔡','🔢','🔣','🔤','🅿️',
      '🔯','☯️','✡️','☪️','✝️','☦️','🛐','⛎',
      '♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓',
      '🔇','🔈','🔉','🔊',
    ]
  },
  {
    title: "Flags",
    emojis: [
      '🏳️','🏴','🏁','🚩','🏳️‍🌈','🏳️‍⚧️','🏴‍☠️',
      '🇺🇸','🇬🇧','🇨🇦','🇦🇺','🇯🇵','🇰🇷','🇨🇳','🇩🇪',
      '🇫🇷','🇮🇹','🇪🇸','🇧🇷','🇲🇽','🇮🇳','🇷🇺','🇸🇦',
      '🇳🇬','🇿🇦','🇦🇷','🇨🇱','🇨🇴','🇵🇪','🇻🇪','🇪🇬',
      '🇹🇷','🇮🇩','🇵🇰','🇧🇩','🇵🇭','🇻🇳','🇹🇭','🇲🇾',
      '🇸🇬','🇳🇿','🇸🇪','🇳🇴','🇩🇰','🇫🇮','🇳🇱','🇧🇪',
      '🇨🇭','🇦🇹','🇵🇹','🇬🇷','🇵🇱','🇺🇦','🇮🇱','🇮🇷',
      '🇨🇿','🇸🇰','🇭🇺','🇷🇴','🇧🇬','🇭🇷','🇷🇸','🇸🇮',
    ]
  },
]

const FALLBACK_EMOJI: Record<string, string> = {
  'personal':     '😎',
  'office':       '💼',
  'social-media': '📱',
  'learning':     '🧠',
  'favorites':     '♥️',
};

const getRoomEmoji = (room: Pick<RoomData, 'id' | 'emoji'>): string =>
  room.emoji || FALLBACK_EMOJI[room.id] || '📌';

// ── Emoji keyword map ─────────────────────────────────────────────────────────
const EMOJI_KEYWORDS: Record<string, string> = {
  // Smileys
  '😀':'grin happy smile face','😁':'beam grin happy','😂':'laugh cry funny lol',
  '🤣':'rofl laugh floor funny','😃':'smile open happy','😄':'grin smile happy eyes',
  '😅':'sweat smile nervous laugh','😆':'laugh grin squint','😇':'angel halo innocent good',
  '😉':'wink flirt playful','😊':'smile blush happy','😋':'yummy tasty food delicious',
  '😌':'relieved calm peaceful','😍':'love heart eyes adore','😎':'cool sunglasses chill',
  '😏':'smirk sly confident','😐':'neutral flat expressionless','😑':'expressionless blank',
  '😒':'unamused bored annoyed','😓':'sweat work hard','😔':'pensive sad disappointed',
  '😕':'confused unsure hmm','😗':'kiss whistle','😘':'kiss love blow heart',
  '😙':'kiss smile','😚':'kiss eyes closed love','😛':'tongue playful tease',
  '😜':'wink tongue crazy','😝':'squint tongue gross','😞':'disappointed sad let down',
  '😟':'worried nervous anxious','😠':'angry mad frown','😡':'rage angry furious red',
  '😢':'cry sad tear sob','😣':'persevere struggle hard','😤':'triumph steam frustrated',
  '😥':'sad cry relieved','😦':'frown open shocked','😧':'anguished shocked pain',
  '😨':'fearful scared shocked','😩':'weary exhausted tired','😪':'sleepy tired zzz',
  '😫':'tired weary exhausted','😬':'grimace awkward nervous','😭':'sob cry loud sad',
  '😮':'surprised open mouth wow','😯':'hushed surprised quiet','😰':'anxious cold sweat fear',
  '😱':'scream fear shocked horror','😲':'astonished shocked wow','😳':'flushed embarrassed red',
  '😴':'sleep tired zzz rest','😵':'dizzy confused spin','😶':'no mouth silent quiet',
  '😷':'mask sick medical ill','🙁':'frown slightly sad','🙂':'slight smile neutral',
  '🙃':'upside down silly sarcasm','🙄':'eye roll annoyed whatever',
  '🤐':'zipper mouth silent secret','🤑':'money dollar greedy rich','🤒':'sick ill fever',
  '🤓':'nerd glasses smart study','🤔':'thinking hmm question ponder','🤕':'injured hurt bandage',
  '🤗':'hug warm affection','🤠':'cowboy western hat','🤡':'clown circus silly',
  '🤢':'nausea sick gross disgusting','🤤':'drool hungry food yummy','🤥':'lying pinocchio',
  '🤧':'sneeze sick allergies','🤨':'raised eyebrow skeptical suspicious',
  '🤩':'star struck excited wow amazing','🤪':'zany crazy wacky silly',
  '🤫':'shush quiet secret whisper','🤬':'cursing angry swear mad',
  '🤭':'hand mouth oops giggle','🤮':'vomit sick gross disgusting',
  '🤯':'exploding head mind blown shocked','🥰':'love smiling hearts affection',
  '🥱':'yawn tired bored sleepy','🥲':'smiling tear happy cry',
  '🥳':'party celebrate birthday','🥴':'woozy drunk dizzy','🥵':'hot sweat fever',
  '🥶':'cold freeze shiver','🥸':'disguise nerd glasses','🥹':'holding back tears emotional',
  '🥺':'pleading puppy eyes cute sad','🫠':'melting hot stress overwhelm',
  '🫢':'gasp shocked hand mouth','🫣':'peek hide eye','🫤':'neutral flat hmm',
  '🫨':'shaking shocked vibrate','😈':'devil mischief evil horns','👿':'angry devil evil',
  '💀':'skull death dead scary','☠️':'skull crossbones danger poison dead',
  '👻':'ghost spooky halloween scary','👹':'ogre monster demon japanese',
  '👺':'goblin red monster mask','💩':'poop funny joke brown','🫥':'dashed face invisible',
  // People
  '👶':'baby infant newborn child','👧':'girl child kid young',
  '👦':'boy child kid young','🧒':'child kid young','👩':'woman female adult',
  '👨':'man male adult','🧑':'person adult neutral','👱':'blond hair person',
  '👴':'old man elderly grandfather','👵':'old woman elderly grandmother',
  '🧔':'beard man facial hair','🧕':'headscarf hijab woman',
  '👲':'chinese hat man cap','🎅':'santa christmas holiday',
  '🤶':'mrs claus christmas holiday','🧑‍🎄':'mx claus christmas',
  '🧑‍🍼':'parent baby feeding','🧑‍🎓':'graduate student education cap',
  '🧑‍🏫':'teacher educator school','🧑‍⚕️':'healthcare doctor nurse medical',
  '🧑‍🍳':'chef cook kitchen food','🧑‍🌾':'farmer agriculture crop',
  '🧑‍🔧':'mechanic repair wrench tool','🧑‍🏭':'factory worker industrial',
  '🧑‍💼':'office worker business professional','🧑‍🔬':'scientist lab research',
  '🧑‍🎨':'artist painter creative design','🧑‍✈️':'pilot flight aviation',
  '🧑‍🚀':'astronaut space rocket','🧑‍🚒':'firefighter rescue emergency',
  '👮':'police officer law enforcement','💂':'guard soldier protect',
  '🕵️':'detective spy investigate secret','👷':'construction worker hard hat build',
  '🫂':'hug embrace comfort support','🧏':'deaf person sign language',
  '🙆':'ok gesture arms agree','🙅':'no gesture arms refuse',
  '💁':'toss hair sassy info','🙋':'raise hand question answer',
  '🤦':'facepalm embarrassed mistake','🤷':'shrug unsure whatever',
  '🥷':'ninja stealthy fighter','🦹':'villain supervillain evil',
  '🦸':'superhero hero power','🧛':'vampire horror undead',
  '🧙':'wizard magic spell','🧟':'zombie undead horror',
  '🫅':'crown royalty person noble','🧝':'elf fantasy magic',
  '🧞':'genie wish magic lamp','🧜':'mermaid sea fantasy',
  '🧚':'fairy magic fantasy wings','🧌':'troll fantasy monster',
  '👍':'thumbs up like good yes approve','👎':'thumbs down dislike bad no',
  '🫰':'snap fingers click','👏':'clap applause bravo celebrate',
  '🙌':'raise hands celebrate cheer','🤝':'handshake deal agreement',
  '🙏':'pray thank please namaste','✌️':'peace victory sign two',
  '👌':'ok perfect fine good','🤞':'fingers crossed luck hope',
  '🫶':'heart hands love care','🤟':'love rock hang loose',
  '🤘':'rock horns metal music','✊':'fist power raised strong',
  '🤜':'fist bump right punch','🤛':'fist bump left punch',
  '🫱':'right hand reach offer','🫲':'left hand receive',
  '🫳':'palm down gesture stop','🫴':'palm up offer receive',
  '🖐️':'raised hand five stop','✋':'raised hand stop high five',
  '🫡':'salute respect soldier','🤙':'call me shaka hang loose',
  '☝️':'point up one index','👆':'point up above',
  '👇':'point down below','👈':'point left back',
  '👉':'point right forward','👀':'eyes look watch see',
  '🧠':'brain mind smart think intelligence','💪':'muscle strong flex bicep arm',
  '🦾':'mechanical arm prosthetic','🦵':'leg kick foot',
  '🦶':'foot sole toes','👂':'ear listen hear',
  '🦻':'ear hearing aid listen','👃':'nose smell sniff',
  '🫀':'heart organ cardiac','🫁':'lungs breathe organ',
  '🦷':'tooth dental','🦴':'bone skeleton dog',
  '👁️':'eye see look watch','👅':'tongue taste lick',
  '🦲':'bald head no hair',
  // Places
  '🏠':'home house residence','🏡':'house garden yard home',
  '🏢':'office building corporate work','🏣':'post office mail',
  '🏤':'european post office mail','🏦':'bank money finance',
  '🏧':'atm cash machine money','🏨':'hotel stay lodging',
  '🏩':'love hotel romance','🏪':'convenience store shop retail',
  '🏫':'school education building learn','🏬':'department store mall shopping',
  '🏭':'factory industrial manufacture','🏗️':'construction building site',
  '🏰':'castle medieval europe fantasy','🏯':'japanese castle fortress',
  '🏛️':'classical building pillars ancient','🕌':'mosque islam prayer',
  '🛕':'hindu temple worship','🕍':'synagogue jewish temple',
  '⛩️':'shinto shrine japan torii','🕋':'kaaba mecca islam',
  '💒':'wedding chapel church marriage','🗼':'eiffel tower paris france',
  '🗽':'statue liberty new york usa','🗿':'moai statue easter island',
  '🏟️':'stadium sports arena concert','🏖️':'beach sand sea vacation sun',
  '🏜️':'desert sand hot dry','🛖':'hut cabin small house',
  '🏘️':'houses neighborhood suburb','🏚️':'abandoned house broken',
  '🌃':'night city lights stars','🌆':'city sunrise dawn urban',
  '🌇':'city sunset dusk golden','🏙️':'city skyline buildings urban',
  '🌁':'foggy city bridge morning','🌉':'bridge night city lights',
  '⛲':'fountain park water','🛋️':'couch sofa living room relax',
  '🛏️':'bed sleep bedroom rest','🚿':'shower clean wash bathroom',
  '🛁':'bathtub bath relax','🪑':'chair seat sit furniture',
  '🚪':'door entrance exit open close','🪞':'mirror reflect vanity',
  '🪟':'window glass frame view','🎠':'carousel merry go round fair',
  '🎡':'ferris wheel carnival fair','🎢':'roller coaster theme park ride',
  // Productivity
  '💼':'briefcase work business professional','📝':'memo note write',
  '📌':'pin thumbtack mark location','📍':'pin red location mark',
  '📎':'paperclip attach fasten','🖇️':'linked paperclips attach',
  '🔧':'wrench tool fix repair','⚙️':'gear settings cog config',
  '🛠️':'tools hammer wrench build fix','💡':'idea lightbulb innovation thought',
  '🔑':'key unlock access open','🗝️':'old key unlock antique',
  '📚':'books study read library learn','📖':'open book read study',
  '📊':'bar chart data graph analytics','📈':'chart up growth trend increase',
  '📉':'chart down decrease decline','📋':'clipboard list checklist',
  '🗂️':'file dividers folder organize tabs','📁':'closed folder files',
  '📂':'open folder files contents','📦':'box package delivery ship',
  '📬':'mailbox mail letter incoming','📮':'postbox mail send letter',
  '📯':'postal horn announcement','✏️':'pencil write draw edit',
  '🖊️':'pen write sign ink','🖋️':'fountain pen write formal',
  '📐':'ruler triangle measure angle','📏':'ruler measure straight line',
  '✂️':'scissors cut trim craft','🔒':'lock secure locked private',
  '🔓':'unlock open access free','🪝':'hook link attach hang',
  '🪤':'mousetrap trap catch','📅':'calendar date schedule event',
  '📆':'calendar tear off date','🗓️':'spiral calendar plan schedule',
  '⏰':'alarm clock wake time','⏱️':'stopwatch time measure speed',
  '⏲️':'timer countdown clock','⌛':'hourglass time wait sand',
  '⏳':'hourglass flow time countdown','📧':'email electronic mail message',
  '📨':'incoming envelope mail receive','📩':'envelope arrow mail',
  '📤':'outbox tray send out','📥':'inbox tray receive in',
  '💬':'speech bubble chat message talk','💭':'thought bubble think idea',
  '🗯️':'anger speech bubble mad','📢':'loudspeaker announce broadcast loud',
  '📣':'megaphone announce cheer loud','🔔':'bell notification alert ring',
  '🔕':'bell mute silent no notification','📓':'notebook notes journal',
  '📔':'notebook cover decorated','📒':'ledger notebook yellow',
  '📕':'closed book red','📗':'closed book green','📘':'closed book blue',
  '📙':'closed book orange','📃':'page document curl','📄':'page document white',
  '📑':'bookmark tabs document','🗒️':'spiral notepad notes','📜':'scroll ancient document',
  '🖥️':'desktop computer monitor screen','🖨️':'printer paper document',
  '⌨️':'keyboard type input computer','🖱️':'mouse cursor click computer',
  '💾':'floppy disk save storage old','💿':'cd disc music data',
  '📀':'dvd disc data storage','📼':'vhs cassette tape video old',
  // Technology
  '💻':'laptop computer code work dev','📱':'phone mobile smartphone app',
  '📲':'phone incoming call notification','☎️':'telephone phone call old landline',
  '📞':'receiver phone call talk','📟':'pager beeper old device',
  '📠':'fax machine send receive old','📺':'television tv watch screen',
  '📻':'radio music broadcast listen','🎙️':'microphone studio record podcast',
  '📷':'camera photo capture picture','📸':'camera flash photo selfie',
  '📹':'video camera record film','🎥':'movie camera cinema film',
  '📡':'satellite dish signal antenna broadcast','🛰️':'satellite orbit space signal',
  '🤖':'robot ai machine automation','👾':'alien monster pixel game',
  '🔭':'telescope astronomy space observe star','🧬':'dna genetics biology science',
  '🔬':'microscope science lab biology small','🧪':'flask lab experiment chemistry',
  '🧫':'petri dish culture biology lab','🔌':'plug power electric connect',
  '🔋':'battery power charge energy','🪫':'low battery empty charge',
  '🖲️':'trackball mouse pointer cursor','🧲':'magnet attract stick science',
  '🛡️':'shield protect security defend','🔐':'lock key secure encrypted',
  '🔏':'lock pen sign sealed','🗜️':'clamp compress vise tool',
  // Entertainment
  '🎨':'art palette paint creative design','🖼️':'frame picture art painting',
  '🎭':'theater masks drama performance','🎬':'clapper film movie cinema',
  '📽️':'film projector cinema movie','🎞️':'film strip movie reel',
  '🎤':'microphone sing karaoke vocal','🎧':'headphones music listen audio',
  '🎵':'music note song melody','🎶':'notes music songs melody',
  '🎼':'musical score sheet notes','🎸':'guitar rock music electric',
  '🎹':'piano keyboard music classical','🎷':'saxophone jazz blues music',
  '🎺':'trumpet brass music jazz','🥁':'drum beat rhythm percussion',
  '🎻':'violin classical music string','🪕':'banjo country folk music',
  '🪘':'drum djembe beat rhythm','🪗':'accordion music squeeze',
  '🪈':'flute recorder music wind','🎟️':'ticket event admission show',
  '🎫':'ticket pass entry event','🎰':'slot machine casino gamble luck',
  '🎲':'dice random game board chance','🃏':'joker card game wild',
  '🀄':'mahjong tile game chinese','🎴':'playing card game flower',
  '♟️':'chess piece strategy board game','🧩':'puzzle jigsaw piece fit',
  '🎳':'bowling strike spare sport','🎉':'party confetti celebrate hooray',
  '🎊':'confetti ball party celebrate','🎈':'balloon party celebrate float',
  '🎁':'gift present surprise wrap','🎀':'ribbon bow gift wrap pink',
  '🎗️':'ribbon awareness cause support','🎆':'fireworks celebrate explode',
  '🎇':'sparkler firework celebrate light','🧨':'firecracker bang explosion',
  '🎋':'tanabata tree bamboo japanese','🎍':'pine decoration japanese new year',
  '🎎':'japanese doll hina girl festival','🎏':'carp streamer japanese koinobori',
  '🎐':'wind chime japanese summer','🎑':'moon viewing japanese festival',
  '🪆':'matryoshka doll russian nesting','🪅':'pinata party hit candy',
  '🪩':'mirror ball disco dance party','🎮':'game controller video gaming',
  '🕹️':'joystick arcade game control',
  // Shopping
  '💄':'lipstick makeup beauty cosmetic red','💋':'kiss lips makeup red beauty',
  '💅':'nail polish manicure beauty care','💍':'ring engagement wedding diamond',
  '⌚':'watch time wrist clock','👗':'dress fashion clothes outfit',
  '👘':'kimono japanese traditional','👙':'bikini swimwear beach swim',
  '🩱':'one piece swimsuit swim beach','🩲':'shorts briefs swim underpants',
  '🩳':'shorts swim beach casual','👠':'heels stiletto shoe fashion women',
  '👡':'sandal heels wedge shoe','👢':'boot knee high shoe fashion',
  '🥿':'flat shoe slip on ballet','👞':'dress shoe formal oxford',
  '👟':'sneaker shoe casual sport sport','🧢':'baseball cap hat sport casual',
  '👒':'straw hat sun fashion summer','🎩':'top hat formal magic gentleman',
  '🪖':'helmet military hard hat protection','👔':'tie necktie formal business suit',
  '🧥':'coat jacket winter outerwear','🧣':'scarf winter wrap neck',
  '🧤':'gloves winter hands cold','🧦':'socks feet warm clothing',
  '👛':'coin purse wallet small bag','👜':'handbag purse fashion woman',
  '🛍️':'shopping bags retail store buy','🎒':'backpack school bag travel',
  '🏷️':'label tag price sale','💰':'money bag cash rich wealth',
  '💵':'dollar bill usd cash money','💴':'yen japanese money currency',
  '💶':'euro european money currency','💷':'pound sterling british money',
  '💸':'money wings flying spend cash','💳':'credit card payment swipe',
  '🪙':'coin gold money currency','💹':'chart yen increase stock market',
  '💎':'diamond gem precious jewelry value','🧴':'lotion bottle skin care cream',
  '🧼':'soap clean wash hygiene','🪥':'toothbrush teeth clean dental',
  '🧹':'broom sweep clean floor','🧺':'basket laundry carry wicker',
  '🧻':'toilet paper roll tissue clean','🪣':'bucket water carry clean',
  '🧽':'sponge clean scrub wash','🪒':'razor shave blade grooming',
  // Travel
  '✈️':'plane airplane flight travel sky','🛫':'plane takeoff departure',
  '🛬':'plane landing arrival airport','🚂':'train steam engine classic',
  '🚃':'train car railway wagon','🚄':'bullet train fast shinkansen japan',
  '🚅':'high speed train fast bullet','🚆':'train railway commute',
  '🚇':'metro subway underground city','🚈':'light rail transit commute',
  '🚉':'station train platform railway','🚊':'tram city street transport',
  '🚋':'tram car street rail','🚌':'bus public transport commute city',
  '🚍':'oncoming bus front transport','🚗':'car automobile drive road',
  '🚕':'taxi cab yellow ride hail','🚙':'suv car jeep off road',
  '🚐':'minibus van transit shuttle','🚑':'ambulance emergency medical rescue',
  '🚒':'fire truck emergency rescue red','🚓':'police car patrol law',
  '🚔':'police car oncoming patrol','🚖':'oncoming taxi cab',
  '🚘':'oncoming automobile car','🏎️':'racing car fast formula sport',
  '🚜':'tractor farm agriculture work','🚚':'delivery truck freight goods',
  '🚛':'semi truck articulated freight big','🛻':'pickup truck off road carry',
  '🚲':'bicycle bike cycle ride eco','🛴':'scooter kick ride city',
  '🏍️':'motorcycle bike speed ride','🛵':'scooter moped motor city',
  '🚁':'helicopter fly rotor air','🛸':'ufo flying saucer alien space',
  '🚀':'rocket launch space mission astronaut','⛵':'sailboat wind water sail',
  '🚤':'speedboat fast water motor','🛥️':'motorboat water speed leisure',
  '🛳️':'cruise ship passenger ocean large','⛴️':'ferry boat passenger water',
  '🚢':'ship cruise ocean voyage sail','🛶':'canoe row paddle water nature',
  '🚠':'cable car mountain gondola aerial','🚡':'suspended monorail elevated',
  '🚞':'mountain railway scenic ride','🚝':'monorail elevated transit',
  '🪂':'parachute skydive fall adventure','⛽':'fuel gas station petrol fill',
  '🛞':'wheel tire vehicle drive','🚦':'traffic light signal go stop',
  '🚥':'horizontal traffic light signal','🚧':'construction barrier roadwork',
  '🗺️':'map world navigate explore','🧳':'luggage suitcase travel bag pack',
  '🛂':'passport control border customs','🛃':'customs declaration border',
  '🛄':'baggage claim luggage airport','🛅':'left luggage storage locker',
  // Animals
  '🐶':'dog puppy pet loyal friend','🐱':'cat kitten pet meow cute',
  '🐭':'mouse small rodent pet','🐹':'hamster pet cage cute small',
  '🐰':'rabbit bunny hop easter cute','🦊':'fox clever sly cunning orange',
  '🐻':'bear grizzly forest wild','🐼':'panda bear bamboo china cute',
  '🐨':'koala australia bear cute eucalyptus','🐯':'tiger stripe wild cat',
  '🦁':'lion king mane wild africa','🐮':'cow moo milk farm',
  '🐷':'pig oink mud pink farm','🐸':'frog hop green pond ribbit',
  '🐵':'monkey ape primate jungle','🙈':'see no evil monkey',
  '🙉':'hear no evil monkey','🙊':'speak no evil monkey',
  '🐔':'chicken bird farm poultry cluck','🐧':'penguin cold arctic bird cute',
  '🐦':'bird generic feather fly tweet','🐤':'chick baby bird yellow cute',
  '🦆':'duck quack water bird','🦅':'eagle bird fly freedom sky majestic',
  '🦉':'owl wise night bird hoot','🦇':'bat night fly halloween cave',
  '🐺':'wolf howl wild forest pack','🐗':'boar wild pig tusk forest',
  '🐴':'horse mane ride neigh brown','🦄':'unicorn magic fantasy rainbow',
  '🐝':'bee honey sting insect yellow','🐛':'caterpillar worm bug green leaf',
  '🦋':'butterfly wings flutter fly color','🐌':'snail slow shell garden',
  '🐞':'ladybug red spots insect lucky','🐜':'ant small colony insect work',
  '🪲':'beetle bug insect hard shell','🦟':'mosquito bite bug fly insect',
  '🦗':'cricket chirp bug insect','🕷️':'spider web scary eight legs',
  '🦂':'scorpion sting danger desert','🦎':'lizard reptile green sun',
  '🐍':'snake slither reptile hiss venom','🐢':'turtle slow shell sea green',
  '🐊':'crocodile alligator reptile teeth','🦕':'brontosaurus long neck dinosaur',
  '🦖':'t-rex tyrannosaurus dinosaur teeth','🦔':'hedgehog spiky small cute',
  '🐉':'dragon fire fantasy medieval','🐲':'dragon green fantasy',
  '🦧':'orangutan ape primate orange','🦣':'mammoth extinct tusk large',
  '🦛':'hippo large water africa heavy','🦏':'rhino horn large africa',
  '🦍':'gorilla ape primate strong','🐘':'elephant large trunk africa memory',
  '🦒':'giraffe tall neck africa spots','🦓':'zebra stripe africa horse',
  '🦬':'bison buffalo wild plains america','🐃':'water buffalo ox asia farm',
  '🐂':'ox bull strong farm work','🐄':'cow milk farm pasture',
  '🐎':'horse race ride gallop fast','🐖':'pig farm pork oink',
  '🐏':'ram sheep wool horns','🐑':'ewe sheep wool soft',
  '🦙':'llama alpaca south america wool','🐐':'goat mountain climb horns',
  '🦌':'deer antler forest bambi wild','🐕':'dog generic pet friendly',
  '🐩':'poodle fluffy dog breed fancy','🦮':'guide dog assistance blind',
  '🐕‍🦺':'service dog vest assistance','🐈':'cat generic pet feline',
  '🐈‍⬛':'black cat night dark mysterious','🪶':'feather bird light write quill',
  '🦃':'turkey thanksgiving bird farm','🦤':'dodo extinct bird large',
  '🦚':'peacock feathers color display blue','🦜':'parrot colorful tropical talk bird',
  '🦢':'swan grace white elegant water','🦩':'flamingo pink elegant water bird',
  '🕊️':'dove peace white bird symbol','🐇':'rabbit bunny hop white',
  '🦝':'raccoon mask stripe clever','🦨':'skunk stripe smell black white',
  '🦡':'badger stripe dig nocturnal','🦦':'otter cute water playful fish',
  '🦥':'sloth slow hang tree lazy','🐁':'mouse small gray rodent',
  '🐀':'rat scurry rodent gray','🐿️':'chipmunk squirrel nut acorn',
  '🦈':'shark ocean danger teeth swim predator','🐬':'dolphin smart ocean play leap',
  '🐳':'whale large ocean water spout','🐋':'humpback whale ocean large marine',
  '🐟':'fish water swim blue ocean','🐠':'clownfish tropical color reef orange',
  '🐡':'blowfish puffer fish inflate round','🦐':'shrimp small seafood pink',
  '🦞':'lobster red seafood claw','🦀':'crab red seafood sidewalk beach',
  '🦑':'squid tentacle ocean ink sea','🐙':'octopus tentacle smart ocean sea',
  // Nature
  '🌿':'plant herb green leaf nature','🌱':'sprout grow seedling new green',
  '🌲':'evergreen pine tree forest','🌳':'deciduous tree park nature',
  '🌴':'palm tropical beach coconut',
  '🍀':'four leaf clover luck green lucky',
  '🍁':'maple leaf fall autumn canada red','🍂':'fallen leaves autumn fall brown',
  '🍃':'leaf flutter green nature wind','🪴':'potted plant home decor indoor',
  '🌵':'cactus desert dry prickly green','🎄':'christmas tree holiday xmas',
  '🌾':'sheaf grain wheat harvest gold','🌸':'cherry blossom spring sakura pink',
  '🌺':'hibiscus tropical flower red bloom','🌻':'sunflower yellow summer bright happy',
  '🌹':'rose red flower love romance','🥀':'wilted rose dead sad flower',
  '🪷':'lotus flower zen buddhism pink','🌷':'tulip flower spring pink',
  '💐':'bouquet flowers gift spring love','🌼':'blossom white daisy flower',
  '🍄':'mushroom fungus forest nature','🌰':'chestnut nut autumn fall brown',
  '🪺':'nest bird egg nature spring','🏔️':'mountain snow peak alpine tall',
  '🏝️':'island tropical ocean palm beach','🏕️':'camping tent outdoors nature',
  '⛰️':'mountain peak rocky hike climb','🌋':'volcano eruption fire lava rock',
  '🗻':'mount fuji mountain japan snow','🏞️':'national park nature scenic',
  '☀️':'sun sunny day bright warm heat','🌤️':'sun cloud partly cloudy sky',
  '⛅':'partly cloudy mixed sky','🌥️':'mostly cloudy overcast sky',
  '☁️':'cloud overcast gray sky','🌦️':'sun rain mixed shower umbrella',
  '🌧️':'rain cloud wet umbrella gray','⛈️':'storm thunder lightning rain cloud',
  '🌩️':'lightning bolt storm cloud electric','🌨️':'snow cloud winter cold',
  '❄️':'snowflake cold winter freeze ice','☃️':'snowman winter cold snow built',
  '⛄':'snowman carrot nose winter coal','🌬️':'wind blow cold gust air',
  '💨':'dash wind air blow fast','🌪️':'tornado twister cyclone wind storm',
  '🌫️':'fog mist haze morning gray','🌈':'rainbow colorful arch sky rain sun',
  '⚡':'lightning electric bolt fast energy storm','🔥':'fire hot flame burn heat',
  '💧':'droplet water rain tear single','🌊':'wave ocean sea surf water big',
  '🌙':'crescent moon night sleep rest','🌛':'first quarter moon night',
  '🌜':'last quarter moon night','🌝':'full moon face bright night',
  '🌚':'new moon dark night face','⭐':'star shine bright night sky',
  '🌟':'glowing star bright shine special','💫':'dizzy star spin sparkle',
  '✨':'sparkles magic shine glitter','☄️':'comet space shooting star impact',
  '🌠':'shooting star sky night wish','🪐':'saturn planet rings space orbit',
  '🌌':'milky way galaxy night sky stars','🌍':'earth europe africa globe world',
  '🌎':'earth americas globe world map','🌏':'earth asia globe world',
  // Food & Drink
  '🍎':'apple red fruit healthy','🍊':'orange fruit citrus vitamin c',
  '🍋':'lemon yellow sour citrus','🍌':'banana yellow tropical fruit sweet',
  '🍍':'pineapple tropical fruit sweet yellow','🥭':'mango tropical fruit yellow sweet',
  '🍑':'peach fuzzy fruit sweet orange','🍒':'cherry red twin fruit sweet',
  '🍓':'strawberry red fruit sweet jam','🫐':'blueberry small round fruit',
  '🥝':'kiwi green fruit tropical inside','🍅':'tomato red vegetable fruit',
  '🫒':'olive mediterranean oil green','🍇':'grapes bunch purple wine fruit',
  '🍈':'melon sweet green honeydew','🍉':'watermelon summer red green large',
  '🥥':'coconut tropical palm white milk','🥑':'avocado green healthy fat guac',
  '🍆':'eggplant purple vegetable aubergine','🥔':'potato brown vegetable starchy',
  '🥕':'carrot orange vegetable healthy','🌽':'corn yellow vegetable maize cob',
  '🌶️':'chili pepper spicy hot red','🫑':'bell pepper capsicum vegetable',
  '🥒':'cucumber green vegetable cool','🥬':'leafy green vegetable healthy',
  '🧄':'garlic cloves pungent bulb white','🧅':'onion layers vegetable pungent',
  '🫘':'beans legume protein healthy',
  '🥜':'peanut nut butter snack allergy',
  '🍞':'bread loaf bake white wheat','🥐':'croissant french buttery breakfast',
  '🥖':'baguette french bread loaf','🫓':'flatbread pita tortilla',
  '🥨':'pretzel salty twisted baked','🧀':'cheese yellow dairy sharp',
  '🥚':'egg white oval raw cook','🍳':'frying egg breakfast cook pan',
  '🧈':'butter yellow dairy spread fat','🥞':'pancakes stack breakfast maple syrup',
  '🧇':'waffle grid breakfast sweet syrup','🥓':'bacon crispy pork breakfast',
  '🥩':'cut meat steak red raw','🍗':'chicken drumstick poultry bbq',
  '🍖':'meat bone rib bbq roasted','🌭':'hotdog sausage bun mustard',
  '🍔':'hamburger burger fast food beef','🍟':'french fries chips potato salty',
  '🍕':'pizza slice cheese tomato italian','🫔':'wrap tortilla roll',
  '🌮':'taco mexican shell filling salsa','🌯':'burrito wrap mexican filled',
  '🥙':'pita stuffed wrap gyro mediterranean','🧆':'falafel middle east chickpea fried',
  '🍱':'bento box japanese lunch container','🍘':'rice cracker japanese snack',
  '🍙':'onigiri rice ball japanese triangle','🍚':'cooked rice bowl steamed asian',
  '🍛':'curry rice spicy indian thai','🍜':'noodles ramen soup bowl asian',
  '🍝':'spaghetti pasta italian tomato sauce','🍠':'roasted sweet potato japanese',
  '🍢':'oden skewer japanese fish cake','🍣':'sushi roll japanese raw fish',
  '🍤':'fried shrimp tempura japanese prawn','🍥':'fish cake spiral japanese ramen',
  '🥮':'moon cake chinese festival pastry','🍡':'dango dumpling japanese sweet stick',
  '🧁':'cupcake frosted sweet bakery dessert','🍰':'cake slice birthday sweet layer',
  '🎂':'birthday cake celebrate candles sweet','🍮':'custard flan dessert caramel',
  '🍭':'lollipop candy sweet pop stick','🍬':'candy wrapped sweet sugar',
  '🍫':'chocolate bar dark sweet cocoa','🍿':'popcorn movie snack cinema corn',
  '🍩':'donut fried dough sweet hole','🍪':'cookie baked sweet chocolate chip',
  '☕':'coffee hot espresso latte morning','🍵':'green tea japanese hot drink',
  '🫖':'teapot brew tea pour ceramic','🧃':'juice box drink straw kid',
  '🥤':'cup drink straw soda smoothie','🧋':'bubble tea boba milk drink',
  '🍶':'sake japanese rice wine cup','🍺':'beer pint mug cold drink hop',
  '🍻':'cheers beer clinking mug friends','🥂':'champagne flute clink celebrate toast',
  '🍷':'wine red glass romance french','🥃':'whiskey tumbler spirits on rocks',
  '🍸':'martini cocktail shaken olive glass','🍹':'tropical cocktail drink beach umbrella',
  '🍾':'champagne bottle celebrate pop cork','🫗':'pouring liquid drink cup glass',
  '🧂':'salt shaker seasoning white flavor','🫙':'jar lid preserve store food',
  '🫚':'oil pour bottle cook olive','🍯':'honey jar pot sweet golden bee',
  '🥫':'canned food tin lid shelf','🧊':'ice cube cold freeze',
  // Activities
  '⚽':'soccer ball kick sport football grass','🏀':'basketball hoop shoot sport court',
  '🏈':'american football throw tackle sport','⚾':'baseball bat hit pitch sport',
  '🥎':'softball pitch women sport','🎾':'tennis racket ball court serve',
  '🏐':'volleyball spike beach net sport','🏉':'rugby oval ball tackle sport',
  '🥏':'frisbee disc throw catch field','🎱':'billiards pool eight ball cue',
  '🏓':'ping pong table tennis paddle ball','🏸':'badminton shuttlecock racket sport',
  '🏒':'ice hockey stick puck rink','🏑':'field hockey stick grass green',
  '🥍':'lacrosse stick net sport','🏏':'cricket bat ball wicket sport',
  '🥅':'goal net score hockey soccer','⛳':'golf hole flag green course',
  '🥊':'boxing glove punch fight sport','🥋':'martial arts karate judo belt uniform',
  '🤺':'fencer sword fight duel sport','🤼':'wrestle grapple sport fight',
  '🤸':'gymnastics cartwheel flip sport','⛹️':'person basketball dribble sport',
  '🤾':'handballl throw score sport','🏇':'horse racing jockey bet fast',
  '🧘':'yoga meditation calm peace balance','🏋️':'weightlifting barbell gym strong',
  '🚴':'cycling bike ride sport speed','🏊':'swimmer pool water sport lap',
  '🏄':'surfer wave ride board beach ocean','🤽':'water polo swim sport ball',
  '🚣':'rowing boat oar water sport','🧗':'climbing rock wall bouldering',
  '⛷️':'skiing ski slope snow winter sport','🏂':'snowboard half pipe winter sport',
  '🛷':'sled snow winter downhill hill','⛸️':'ice skate winter rink glide',
  '🎿':'ski snow winter slope mountain','🛼':'roller skate wheel ride rink',
  '🤿':'scuba dive underwater mask fins','🎣':'fishing rod lake water hobby',
  '🏹':'archery bow arrow target shoot','🪃':'boomerang throw return curved',
  '🪀':'yo-yo toy spin trick play','🪁':'slingshot shoot aim game',
  '🏆':'trophy award win champion first','🥇':'gold medal first place winner',
  '🥈':'silver medal second place award','🥉':'bronze medal third place award',
  '🏅':'medal sports award winner honor','🎖️':'military decoration service honor',
  '🏵️':'rosette award decoration pin','🎯':'target dart aim bullseye focus goal',
  '⛺':'tent camping outdoors shelter',
  '🎪':'circus tent show performance big',
  // Health
  '🏥':'hospital medical building health emergency','💊':'pill medicine medication tablet',
  '💉':'syringe injection needle vaccine','🩺':'stethoscope doctor medical listen',
  '🩻':'xray scan bone medical','🩹':'bandage aid wound heal stick',
  '🩼':'crutch injury disabled support','🩸':'blood drop red medical health',
  '💆':'massage relax head spa stress','💇':'haircut barber beauty salon',
  '🧖':'sauna steam bath relax spa','🛌':'bed rest sleep ill sick',
  '🛀':'bath wash clean relax soak','🏃':'runner jog exercise fitness fast',
  '🚶':'walking person stroll pace casual','🧎':'kneeling person prayer floor',
  '🧍':'standing person upright wait',
  '💤':'zzz sleep bubble rest quiet',
  // Objects
  '🏮':'red lantern chinese light festival','🪔':'diya oil lamp fire light india',
  '🔦':'flashlight beam shine portable light','🕯️':'candle light flame wax ambient',
  '🔨':'hammer tool hit build fix nail','⚒️':'crossed tools hammer pick',
  '⛏️':'pickaxe mine dig tool','🔩':'bolt nut screw metal hardware',
  '🪛':'screwdriver turn fix tool','🔗':'chain link connect attach',
  '🧰':'toolbox tools kit repair fix','🪜':'ladder climb step reach up',
  '🧱':'brick wall build construct red','🔮':'crystal ball magic future psychic',
  '🧿':'nazar amulet evil eye protect blue','🪬':'hamsa evil eye protect hand',
  '🪄':'magic wand wizard spell trick','🎃':'jack o lantern pumpkin halloween',
  '⚔️':'swords crossed battle fight war','🗡️':'dagger sword knife blade fight',
  '🧸':'teddy bear soft toy hug cute',
  '👑':'crown royal king queen power',
  '🧧':'red envelope chinese gift money lucky',
  // Symbols
  '❤️':'red heart love passion romance','🧡':'orange heart warm friendly',
  '💛':'yellow heart happy friendship','💚':'green heart nature health envy',
  '💙':'blue heart calm trust loyal','💜':'purple heart spirit compassion',
  '🖤':'black heart dark edgy cool','🤍':'white heart pure clean innocent',
  '🤎':'brown heart warm earthy natural','💔':'broken heart sad heartbreak',
  '❣️':'heart exclamation love strong','💕':'two hearts love couple',
  '💞':'revolving hearts love spin','💓':'beating heart love pulse',
  '💗':'growing heart love pink light','💖':'sparkling heart love shine',
  '💘':'heart arrow cupid love struck','💝':'gift heart love ribbon',
  '💟':'heart decoration outline','♥️':'suit heart card love',
  '✅':'check mark done complete green','❌':'cross mark wrong no red',
  '⭕':'circle red hollow ring','🔴':'red circle dot stop',
  '🟠':'orange circle dot','🟡':'yellow circle dot caution',
  '🟢':'green circle dot go ok','🔵':'blue circle dot',
  '🟣':'purple circle dot','⚫':'black circle dark void',
  '⚪':'white circle light blank','🟤':'brown circle dot',
  '🔶':'orange diamond large shape','🔷':'blue diamond large shape',
  '🔸':'orange diamond small shape','🔹':'blue diamond small shape',
  '🔺':'red triangle up pointing','🔻':'red triangle down pointing',
  '💠':'diamond blue decoration','🔘':'radio button circle',
  '🔲':'black button square','🔳':'white button square',
  '♻️':'recycle loop green environment','✔️':'check mark tick done confirm',
  '➕':'plus add more increase','➖':'minus subtract less decrease',
  '➗':'divide split math','✖️':'multiply times cross math',
  '💯':'hundred percent perfect complete score','‼️':'double exclamation warning strong',
  '⁉️':'exclamation question mix surprise','❓':'question mark unknown hmm',
  '❔':'white question mark unknown','❕':'white exclamation mark note',
  '❗':'red exclamation mark important alert','⬆️':'up arrow north increase',
  '⬇️':'down arrow south decrease','⬅️':'left arrow back previous west',
  '➡️':'right arrow forward next east','↗️':'upper right arrow diagonal',
  '↘️':'lower right arrow diagonal','↙️':'lower left arrow diagonal',
  '↖️':'upper left arrow diagonal','↕️':'up down arrow vertical both',
  '↔️':'left right arrow horizontal both','🔁':'repeat loop cycle arrows',
  '🔂':'repeat single one loop','🔃':'clockwise vertical arrows cycle',
  '🔄':'counterclockwise arrows refresh','🅰️':'blood type a letter',
  '🅱️':'blood type b letter','🆎':'ab blood type letters',
  '🆑':'cl abbreviation letters','🆒':'cool word letters button',
  '🆓':'free word button no cost','🆔':'id identity button',
  '🆕':'new word button recent','🆖':'ng no good word',
  '🆗':'ok word button fine','🆘':'sos emergency help signal',
  '🆙':'up button raised word','🆚':'vs versus battle comparison',
  '🔠':'abcd uppercase letters input','🔡':'abcd lowercase letters input',
  '🔢':'1234 numbers input digits','🔣':'symbols input characters',
  '🔤':'abc latin letters input','🅿️':'parking p blue sign',
  '🔯':'dotted six star david','☯️':'yin yang balance harmony tao',
  '✡️':'star david jewish hexagram','☪️':'star crescent moon islam',
  '✝️':'latin cross christian religion','☦️':'orthodox cross religion',
  '🛐':'place worship pray religion all','⛎':'ophiuchus zodiac sign',
  '♈':'aries zodiac ram fire','♉':'taurus zodiac bull earth',
  '♊':'gemini zodiac twins air','♋':'cancer zodiac crab water',
  '♌':'leo zodiac lion fire','♍':'virgo zodiac earth maiden',
  '♎':'libra zodiac scale air balance','♏':'scorpio zodiac water scorpion',
  '♐':'sagittarius zodiac fire archer','♑':'capricorn zodiac earth goat',
  '♒':'aquarius zodiac air water bearer','♓':'pisces zodiac water fish',
  '🔇':'muted speaker no sound','🔈':'low volume speaker quiet',
  '🔉':'medium volume speaker sound','🔊':'loud volume speaker high',
  // Flags
  '🏳️':'white flag surrender peace','🏴':'black flag pirate',
  '🏁':'checkered flag finish race end','🚩':'red flag warning mark location',
  '🏳️‍🌈':'rainbow pride lgbtq flag','🏳️‍⚧️':'transgender pride flag',
  '🏴‍☠️':'pirate skull crossbones black',
};

const searchEmoji = (q: string, emoji: string, groupTitle: string): boolean => {
  if (!q) return true;
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = `${groupTitle} ${EMOJI_KEYWORDS[emoji] || ''}`.toLowerCase();
  return words.every(w => haystack.includes(w));
};

// ── Panel base style ──────────────────────────────────────────────────────────
const panelStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 'calc(100% + 25px)',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'var(--surface-panel-bg)',
  backdropFilter: 'var(--surface-blur)',
  WebkitBackdropFilter: 'var(--surface-blur)',
  border: 'var(--border-panel)',
  borderRadius: 20,
  padding: 14,
  boxShadow: 'var(--shadow-panel)',
  zIndex: 200,
};

const emojiPickerStyle: React.CSSProperties = {
  ...panelStyle,
  padding: 10,
  borderRadius: 16,
  width: 288,
};

// ── Toolbar ───────────────────────────────────────────────────────────────────
const Toolbar = () => {
  // ── Custom emoji input helper ─────────────────────────────────────────────
  /**
   * Renders a compact text input + Add button that lets the user type or
   * paste any emoji, extracting the first grapheme cluster so multi-codepoint
   * emoji (flags, ZWJ sequences, skin tones) survive intact.
   */
  const renderCustomEmojiField = (onSelect: (e: string) => void) => {
    const apply = () => {
      const trimmed = customEmojiInput.trim();
      if (!trimmed) return;
      const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
      const first = segmenter.segment(trimmed)[Symbol.iterator]().next().value;
      if (first) onSelect(first.segment);
      setCustomEmojiInput('');
    };
    return (
      <>
        <input
          value={customEmojiInput}
          onChange={e => setCustomEmojiInput(e.target.value)}
          onClick={e => e.stopPropagation()}
          onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); apply(); } }}
          placeholder="😍"
          style={{ width: 44, height: 44, minWidth: 0, flexShrink: 0, textAlign: 'center', background: 'var(--surface-inset-bg)', border: 'var(--border-panel)', borderRadius: 12, padding: 0, color: 'var(--text-primary)', fontSize: 22, outline: 'none', boxSizing: 'border-box' }}
        />
        <button
          onClick={e => { e.stopPropagation(); apply(); }}
          title="Use custom emoji"
          style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 12, background: 'var(--surface-inset-bg)', border: 'var(--border-panel)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Check size={17} strokeWidth={2.5} />
        </button>
      </>
    );
  };

  // ── Emoji picker helper ───────────────────────────────────────────────────
  /**
   * Renders the categorized emoji picker content.
   * @param onSelect Callback when an emoji is clicked
   * @param currentEmoji (Optional) Currently selected emoji for highlighting
   * @param isInline (Optional) If true, renders without absolute positioning panel container
   */
  const renderEmojiPicker = (
    onSelect: (e: string) => void,
    currentEmoji?: string,
    isInline = false
  ) => {
    const q = emojiSearch.trim().toLowerCase();
    const filteredGroups = q
      ? EMOJI_GROUPS.map(g => ({
          ...g,
          emojis: g.emojis.filter(e => searchEmoji(q, e, g.title)),
        })).filter(g => g.emojis.length > 0)
      : EMOJI_GROUPS;

    const content = (
      <>
        <input
          value={emojiSearch}
          onChange={e => setEmojiSearch(e.target.value)}
          placeholder="Search category…"
          onClick={e => e.stopPropagation()}
          style={{ width: '100%', background: 'var(--surface-inset-bg)', border: 'var(--border-panel)', borderRadius: 8, padding: '6px 10px', color: 'var(--text-primary)', fontSize: 12, outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
        />
        <div style={{ maxHeight: isInline ? 180 : 230, paddingRight: 4, overflowY: "auto", overflowX: 'hidden' }}>
          {filteredGroups.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>No results</div>
          ) : filteredGroups.map(group => (
            <div key={group.title} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5, paddingLeft: 2 }}>
                {group.title}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 2 }}>
                {group.emojis.map((emoji, emojiIdx) => {
                  const active = emoji === currentEmoji;
                  return (
                    <button
                      key={`${group.title}-${emojiIdx}`}
                      onClick={() => onSelect(emoji)}
                      style={{ width: 30, height: 30, borderRadius: 7, background: active ? "rgba(var(--accent-rgb),0.12)" : "transparent", border: active ? "1px solid rgba(var(--accent-rgb),0.3)" : "none", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.1s" }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface-inset-bg)'; }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </>
    );

    if (isInline) return <div style={{ marginTop: 8, marginBottom: 8 }}>{content}</div>;

    return (
      <div style={emojiPickerStyle} ref={emojiPickerRef as any}>
        {content}
      </div>
    );
  };

  const addNode = useStore((s) => s.addNode);
  const setEditingNodeId = useStore((s) => s.setEditingNodeId);
  const autoArrange = useStore((s) => s.autoArrange);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const canUndo = useStore((s) => s._past.length > 0);
  const canRedo = useStore((s) => s._future.length > 0);
  const currentRoomId = useStore((s) => s.currentRoomId);
  const switchRoom = useStore((s) => s.switchRoom);
  const rooms = useStore((s) => s.rooms);
  const addRoom = useStore((s) => s.addRoom);
  const deleteRoom = useStore((s) => s.deleteRoom);
  const updateRoomEmoji = useStore((s) => s.updateRoomEmoji);
  const updateRoomName = useStore((s) => s.updateRoomName);
  const nodes = useStore((s) => s.nodes);
  const groups = useStore((s) => s.groups);
  const activeTagFilters = useStore((s) => s.activeTagFilters);
  const toggleTagFilter = useStore((s) => s.toggleTagFilter);
  const autoOpenBookmarks = useStore((s) => s.autoOpenBookmarks);
  const setAutoOpenBookmarks = useStore((s) => s.setAutoOpenBookmarks);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const setPendingNavigation = useStore((s) => s.setPendingNavigation);
  const dossiers = useStore((s) => s.dossiers);
  const currentDossierId = useStore((s) => s.currentDossierId);
  const switchDossier = useStore((s) => s.switchDossier);
  const addDossier = useStore((s) => s.addDossier);
  const deleteDossier = useStore((s) => s.deleteDossier);
  const duplicateDossier = useStore((s) => s.duplicateDossier);
  const updateDossierName = useStore((s) => s.updateDossierName);
  const exportDossier = useStore((s) => s.exportDossier);
  const parseDossierFile = useStore((s) => s.parseDossierFile);
  const commitImportDossier = useStore((s) => s.commitImportDossier);
  const { screenToFlowPosition, fitView, setCenter } = useReactFlow();

  const allTags = React.useMemo(() => {
    const set = new Set<string>();
    nodes.forEach(n => (n.data.tags as string[] | undefined)?.forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [nodes]);

  // ── State ─────────────────────────────────────────────────────────────────
  const [showRooms, setShowRooms] = React.useState(false);
  const [showTags, setShowTags] = React.useState(false);
  const [showMenu, setShowMenu] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState<{ id: string; name: string } | null>(null);
  const [deleteDossierConfirm, setDeleteDossierConfirm] = React.useState<{ id: string; name: string } | null>(null);
  const [showDossierModal, setShowDossierModal] = React.useState(false);
  const [showAddDossier, setShowAddDossier] = React.useState(false);
  const [newDossierName, setNewDossierName] = React.useState('');
  const [dossierMenuId, setDossierMenuId] = React.useState<string | null>(null);
  const [focusedDossierId, setFocusedDossierId] = React.useState<string | null>(null);
  const [renamingDossierId, setRenamingDossierId] = React.useState<string | null>(null);
  const [renameDossierValue, setRenameDossierValue] = React.useState('');
  const [showExportModal, setShowExportModal] = React.useState(false);
  const [exportNameValue, setExportNameValue] = React.useState('');
  const [pendingImportDossier, setPendingImportDossier] = React.useState<Dossier | null>(null);
  const [pendingImportName, setPendingImportName] = React.useState('');
  const importDossierRef = React.useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isCompact, setIsCompact] = React.useState(false);
  const [maxInlineRooms, setMaxInlineRooms] = React.useState(8);
  const [showOverflow, setShowOverflow] = React.useState(false);
  const [showSearch, setShowSearch] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showAddWs, setShowAddWs] = React.useState(false);
  const [newWsName, setNewWsName] = React.useState('');
  const [newWsEmoji, setNewWsEmoji] = React.useState('📌');
  const [activeEmojiGroup, setActiveEmojiGroup] = React.useState(0);
  // ID of the room whose emoji is being edited; 'new' for add-workspace panel
  const [emojiPickerFor, setEmojiPickerFor] = React.useState<string | null>(null);
  const [emojiSearch, setEmojiSearch] = React.useState('');
  const [customEmojiInput, setCustomEmojiInput] = React.useState('');
  React.useEffect(() => { setEmojiSearch(''); setCustomEmojiInput(''); }, [emojiPickerFor]);
  // ID of room being renamed (inline edit panel)
  const [renamingRoomId, setRenamingRoomId] = React.useState<string | null>(null);
  const [renameValue, setRenameValue] = React.useState('');
  const [hoveredRoomId, setHoveredRoomId] = React.useState<string | null>(null);
  const [roomMenuPos, setRoomMenuPos] = React.useState<{ x: number; y: number; roomId: string } | null>(null);
  const [draggedRoomId, setDraggedRoomId] = React.useState<string | null>(null);
  const [newTabEnabled, setNewTabEnabled] = React.useState(false);
  const [extensionInstalled, setExtensionInstalled] = React.useState(false);
  const [activeExtIds, setActiveExtIds] = React.useState<string[]>([]);
  const EXT_IDS = ['cnopkpkjbkbccgikjggidpojcjchclpe', 'eknaebeohhiajlpglnamkdmbgggblomb'];

  const tagsCloseTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const settingsCloseTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const overflowCloseTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const reorderRoomsAction = useStore((s) => s.reorderRooms);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';

    const room = rooms.find(r => r.id === id);
    if (room) {
      const ghost = document.createElement('div');
      ghost.style.cssText = 'position:fixed;top:-1000px;left:-1000px;display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 14px;background:var(--surface-panel-bg);border:var(--border-panel);border-radius:14px;pointer-events:none;';
      const emoji = document.createElement('div');
      emoji.style.cssText = 'font-size:22px;line-height:1;';
      emoji.textContent = getRoomEmoji(room);
      const name = document.createElement('div');
      name.style.cssText = 'font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);white-space:nowrap;';
      name.textContent = room.name.length > 10 ? room.name.slice(0, 9) + '…' : room.name;
      ghost.appendChild(emoji);
      ghost.appendChild(name);
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, ghost.offsetWidth / 2, ghost.offsetHeight / 2);
      requestAnimationFrame(() => { document.body.removeChild(ghost); setDraggedRoomId(id); });
    } else {
      requestAnimationFrame(() => setDraggedRoomId(id));
    }
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedRoomId || draggedRoomId === targetId) return;

    const fromIndex = rooms.findIndex(r => r.id === draggedRoomId);
    const toIndex = rooms.findIndex(r => r.id === targetId);

    if (fromIndex !== -1 && toIndex !== -1) {
      const newRooms = [...rooms];
      const [moved] = newRooms.splice(fromIndex, 1);
      newRooms.splice(toIndex, 0, moved);
      reorderRoomsAction(newRooms);
    }
  };

  const handleDragEnd = () => {
    setDraggedRoomId(null);
  };

  React.useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setIsMobile(w <= 768);
      setIsCompact(w <= 576);
      if (w <= 992) setMaxInlineRooms(0);
      else if (w <= 1200) setMaxInlineRooms(3);
      else if (w <= 1400) setMaxInlineRooms(5);
      else setMaxInlineRooms(8);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  React.useEffect(() => {
    const clear = () => setDraggedRoomId(null);
    window.addEventListener('mouseup', clear);
    return () => window.removeEventListener('mouseup', clear);
  }, []);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const roomsRef = React.useRef<HTMLDivElement>(null);
  const tagsRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const settingsRef = React.useRef<HTMLDivElement>(null);
  const settingsBtnRef = React.useRef<HTMLButtonElement>(null);
  const roomsBtnRef = React.useRef<HTMLButtonElement>(null);
  const overflowRef = React.useRef<HTMLDivElement>(null);
  const addWsRef = React.useRef<HTMLDivElement>(null);
  const addWsBtnRef = React.useRef<HTMLButtonElement>(null);
  const tagsBtnRef = React.useRef<HTMLButtonElement>(null);
  const wsInputRef = React.useRef<HTMLInputElement>(null);
  const searchRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const searchBtnRef = React.useRef<HTMLButtonElement>(null);
  const renameInputRef = React.useRef<HTMLInputElement>(null);
  // Emoji picker ref — attached to whichever tab is being edited
  const emojiPickerRef = React.useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

  // ── Extension: detect install + load new tab setting ─────────────────────
  React.useEffect(() => {
    const cr = (window as any).chrome;
    if (!cr?.runtime?.sendMessage) return;
    const ping = (id: string): Promise<boolean> => new Promise((resolve) => {
      try {
        cr.runtime.sendMessage(id, { type: 'BOARDBACK_PING' }, (res: any) => {
          if (cr.runtime.lastError) resolve(false);
          else resolve(!!res?.installed);
        });
      } catch { resolve(false); }
    });
    (async () => {
      const results = await Promise.all(EXT_IDS.map(id => ping(id).then(ok => ok ? id : null)));
      const foundIds = results.filter(Boolean) as string[];
      if (foundIds.length > 0) {
        setExtensionInstalled(true);
        setActiveExtIds(foundIds);
        cr.runtime.sendMessage(foundIds[0], { type: 'GET_NEW_TAB' }, (r: any) => {
          if (!cr.runtime.lastError) setNewTabEnabled(!!r?.enabled);
        });
      }
    })();
  }, []);

  const handleNewTabToggle = () => {
    if (activeExtIds.length === 0) return;
    const next = !newTabEnabled;
    setNewTabEnabled(next);
    const cr = (window as any).chrome;
    activeExtIds.forEach(id => {
      cr?.runtime?.sendMessage(id, { type: 'SET_NEW_TAB', enabled: next }, () => {
        void cr.runtime.lastError;
      });
    });
  };

  const handleDossierImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const parsed = await parseDossierFile(file);
      if (parsed) {
        setPendingImportDossier(parsed);
        setPendingImportName(parsed.name);
      }
    }
    e.target.value = '';
  };

  // ── Outside-click effects ─────────────────────────────────────────────────
  React.useEffect(() => {
    if (!showRooms) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        roomsRef.current && !roomsRef.current.contains(t) &&
        roomsBtnRef.current && !roomsBtnRef.current.contains(t)
      ) { setShowRooms(false); setShowAddWs(false); setEmojiPickerFor(null); setNewWsName(''); setShowSettings(false); }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showRooms]);

  React.useEffect(() => {
    if (!showTags) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        tagsRef.current && !tagsRef.current.contains(t) &&
        tagsBtnRef.current && !tagsBtnRef.current.contains(t)
      ) setShowTags(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showTags]);

  React.useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  React.useEffect(() => {
    if (!showOverflow) return;
    const handler = (e: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) setShowOverflow(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showOverflow]);

  React.useEffect(() => {
    if (!showAddWs) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        addWsRef.current && !addWsRef.current.contains(t) &&
        addWsBtnRef.current && !addWsBtnRef.current.contains(t)
      ) {
        setShowAddWs(false); setNewWsName(''); setNewWsEmoji('📌'); setEmojiPickerFor(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showAddWs]);

  // Edit-room panel outside-click (rename + emoji picker for existing tabs)
  React.useEffect(() => {
    if (!renamingRoomId) return;
    const handler = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        const currentName = renameInputRef.current?.value.trim();
        if (currentName) updateRoomName(renamingRoomId, currentName);
        setEmojiPickerFor(null);
        setRenamingRoomId(null);
        setRenameValue('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [renamingRoomId]);

  // Room context menu outside-click
  React.useEffect(() => {
    if (!roomMenuPos) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-room-wrapper]')) return;
      setRoomMenuPos(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [roomMenuPos]);

  // Emoji picker outside-click (for existing room tabs only; 'new' is inside addWsRef)
  React.useEffect(() => {
    if (!emojiPickerFor || emojiPickerFor === 'new' || renamingRoomId) return;
    const handler = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node))
        setEmojiPickerFor(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [emojiPickerFor, renamingRoomId]);

  React.useEffect(() => {
    if (showAddWs) setTimeout(() => wsInputRef.current?.focus(), 50);
    else { setNewWsName(''); setNewWsEmoji('📌'); setEmojiPickerFor(null); }
  }, [showAddWs]);

  React.useEffect(() => {
    if (!showSettings) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        settingsRef.current && !settingsRef.current.contains(t) &&
        settingsBtnRef.current && !settingsBtnRef.current.contains(t)
      ) setShowSettings(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSettings]);


  React.useEffect(() => {
    if (!showSearch) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        searchRef.current && !searchRef.current.contains(t) &&
        (!searchBtnRef.current || !searchBtnRef.current.contains(t))
      ) { setShowSearch(false); setSearchQuery(''); }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSearch]);

  // Cmd/Ctrl+F → open search
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchInputRef.current?.focus(), 0);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────
  const center = (offsetX = 0, offsetY = 0) => {
    const pos = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    return { x: pos.x - offsetX + (Math.random() - 0.5) * 80, y: pos.y - offsetY + (Math.random() - 0.5) * 80 };
  };

  const handleAddBookmark = () => {
    const id = uuidv4();
    addNode({ id, type: 'bookmark', position: center(90, 65), width: 300, data: { title: '', url: '' }, createdAt: new Date().toISOString() });
    setEditingNodeId(id);
  };

  const handleAddSticker = () => {
    const id = uuidv4();
    addNode({ id, type: 'note', position: center(150, 240), width: 400, height: 280, data: { title: '', content: '' }, createdAt: new Date().toISOString() });
    setEditingNodeId(id);
  };

  const handleAddGroup = () => {
    const id = uuidv4();
    addNode({ id, type: 'group', position: center(160, 120), width: 800, height: 600, data: { title: '' }, createdAt: new Date().toISOString() });
    setEditingNodeId(id);
  };

  const handleAddWorkspace = () => {
    const name = newWsName.trim();
    if (!name) return;
    addRoom(name, newWsEmoji);
    setShowAddWs(false);
  };

  const startRenaming = (room: { id: string; name: string }) => {
    setRenamingRoomId(room.id);
    setRenameValue(room.name);
    setTimeout(() => renameInputRef.current?.focus(), 50);
  };

  const commitRename = () => {
    if (renamingRoomId) updateRoomName(renamingRoomId, renameValue);
    setRenamingRoomId(null);
    setRenameValue('');
  };

  // ── Computed ──────────────────────────────────────────────────────────────
  const currentRoom = rooms.find(r => r.id === currentRoomId) ?? rooms[0];
  const hasActiveFilters = activeTagFilters.length > 0;
  const visibleRooms = rooms.slice(0, maxInlineRooms);
  const overflowRooms = rooms.slice(maxInlineRooms);

  const searchResults = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const results: { id: string; type: 'bookmark' | 'note' | 'group'; title: string; subtitle?: string; position: { x: number; y: number }; width?: number; height?: number; roomId: string; roomName: string; roomEmoji: string }[] = [];
    rooms.forEach(room => {
      const roomNodes = room.id === currentRoomId ? nodes : room.nodes;
      const roomEmoji = getRoomEmoji(room);

      // Build id→absolute-position map so child nodes (inside groups) resolve correctly.
      // Child node positions in ReactFlow are relative to their parent group.
      const absPos = new Map<string, { x: number; y: number }>();
      roomNodes.forEach(n => absPos.set(n.id, n.position));
      roomNodes.forEach(n => {
        const parentId = (n as any).parentId || (n as any).parentNode;
        if (parentId) {
          const p = absPos.get(parentId) ?? { x: 0, y: 0 };
          absPos.set(n.id, { x: p.x + n.position.x, y: p.y + n.position.y });
        }
      });

      roomNodes.forEach(n => {
        const pos = absPos.get(n.id) ?? n.position;
        if (n.type === 'bookmark' || n.type === 'tab') {
          const title = (typeof n.data.title === 'string' ? n.data.title : '').toLowerCase();
          const url = (typeof n.data.url === 'string' ? n.data.url : '').toLowerCase();
          const desc = (typeof n.data.description === 'string' ? n.data.description : '').toLowerCase();
          if (title.includes(q) || url.includes(q) || desc.includes(q)) {
            results.push({ id: n.id, type: 'bookmark', title: (n.data.title as string) || (n.data.url as string) || 'Untitled', subtitle: n.data.url as string, position: pos, width: n.width ?? 180, height: n.height ?? 120, roomId: room.id, roomName: room.name, roomEmoji });
          }
        } else if (n.type === 'note') {
          const title = (typeof n.data.title === 'string' ? n.data.title : '').toLowerCase();
          const content = (typeof n.data.content === 'string' ? n.data.content : '').toLowerCase();
          if (title.includes(q) || content.includes(q)) {
            results.push({ id: n.id, type: 'note', title: (n.data.title as string) || 'Untitled Note', subtitle: n.data.content as string, position: pos, width: n.width ?? 180, height: n.height ?? 180, roomId: room.id, roomName: room.name, roomEmoji });
          }
        } else if (n.type === 'group') {
          const title = (typeof n.data.title === 'string' ? n.data.title : '').toLowerCase();
          if (title.includes(q)) {
            results.push({ id: n.id, type: 'group', title: (n.data.title as string) || 'Untitled Group', position: pos, width: n.width ?? 800, height: n.height ?? 600, roomId: room.id, roomName: room.name, roomEmoji });
          }
        }
      });
    });
    const seen = new Set<string>();
    return results.filter(r => {
      const key = `${r.id}-${r.roomId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [searchQuery, rooms, nodes, currentRoomId]);

  const handleSearchResultClick = (result: { roomId: string; position: { x: number; y: number }; width?: number; height?: number }) => {
    const x = result.position.x + (result.width ?? 180) / 2;
    const y = result.position.y + (result.height ?? 120) / 2;
    if (result.roomId !== currentRoomId) {
      setPendingNavigation({ x, y });
      switchRoom(result.roomId);
    } else {
      setCenter(x, y, { zoom: 1, duration: 400 });
    }
    setShowSearch(false);
    setSearchQuery('');
  };

  // ── Style helpers ─────────────────────────────────────────────────────────
  const labelStyle: React.CSSProperties = {
    fontSize: 9, fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.08em', userSelect: 'none', lineHeight: 1,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
  };

  const mkBtnStyle = (active = false): React.CSSProperties => ({
    width: isMobile ? 34 : 44, height: isMobile ? 32 : 36, borderRadius: 13,
    background: active ? 'rgba(var(--accent-rgb),0.12)' : 'transparent', border: 'none',
    color: active ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.18s ease', position: 'relative', top: isMobile ? 0 : '-5px',
  });

  const onEnter = (e: React.MouseEvent<HTMLButtonElement>, skip = false) => {
    if (skip) return;
    const el = e.currentTarget as HTMLButtonElement;
    el.style.background = 'var(--surface-inset-bg)';
    el.style.color = 'var(--text-primary)';
    el.style.transform = 'translateY(-2px)';
  };
  const onLeave = (e: React.MouseEvent<HTMLButtonElement>, skip = false) => {
    if (skip) return;
    const el = e.currentTarget as HTMLButtonElement;
    el.style.background = 'transparent';
    el.style.color = 'var(--text-muted)';
    el.style.transform = 'translateY(0)';
  };
  const onDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0) scale(0.92)';
  };

  // ── Add workspace panel (shared) ──────────────────────────────────────────
  const renderAddWsPanel = () => (
    <div ref={addWsRef} style={{ ...panelStyle, minWidth: 230 }}>
      <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
        New board
      </div>
      {/* Emoji selector */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setEmojiPickerFor(emojiPickerFor === 'new' ? null : 'new')}
            style={{ width: 44, height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12, background: emojiPickerFor === 'new' ? 'rgba(var(--accent-rgb),0.10)' : 'var(--surface-inset-bg)', border: emojiPickerFor === 'new' ? '1px solid rgba(var(--accent-rgb),0.3)' : 'var(--border-panel)', cursor: 'pointer', transition: 'all 0.15s' }}
          >
            <span style={{ fontSize: 22, lineHeight: 1 }}>{newWsEmoji}</span>
          </button>
          {emojiPickerFor === 'new' && renderCustomEmojiField((emoji) => setNewWsEmoji(emoji))}
        </div>
        {emojiPickerFor === 'new' && renderEmojiPicker(
          (emoji) => {
            setNewWsEmoji(emoji);
            setEmojiPickerFor(null);
          },
          newWsEmoji,
          true
        )}
      </div>
      {/* Name input */}
      <div style={{ display: 'flex', gap: 7 }}>
        <input
          ref={wsInputRef}
          value={newWsName}
          onChange={e => setNewWsName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAddWorkspace(); if (e.key === 'Escape') setShowAddWs(false); }}
          placeholder="Board name..."
          style={{ flex: 1, background: 'var(--surface-inset-bg)', border: 'var(--border-panel)', borderRadius: 10, padding: '8px 10px', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }}
        />
        <button
          onClick={handleAddWorkspace}
          disabled={!newWsName.trim()}
          style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 10, background: newWsName.trim() ? 'var(--accent-bright)' : 'var(--surface-inset-bg)', border: newWsName.trim() ? 'var(--border-panel)' : 'var(--border-panel)', color: newWsName.trim() ? '#0a0b16' : 'var(--text-muted)', cursor: newWsName.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
        >
          <Check size={15} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );

  // ── Shared rooms panel (mobile/compact) ───────────────────────────────────
  const renderRoomsPanel = (width: number) => (
    <div ref={roomsRef} style={{ ...panelStyle, width: Math.min(width, window.innerWidth - 32) }}>
      <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, paddingLeft: 2 }}>
        Boards
      </div>
      {!showAddWs ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {rooms.map(room => {
            const active = room.id === currentRoomId;
            const isDragging = room.id === draggedRoomId;
            return (
              <div key={room.id}
                style={{ position: 'relative', opacity: isDragging ? 0.3 : 1, transition: 'all 0.2s cubic-bezier(.34,1.56,.64,1)', transform: isDragging ? 'scale(0.95)' : 'scale(1)', cursor: 'grab' }}
                draggable
                onDragStart={(e) => handleDragStart(e, room.id)}
                onDragOver={(e) => handleDragOver(e, room.id)}
                onDragEnd={handleDragEnd}
              >
                <button onClick={() => { switchRoom(room.id); setShowRooms(false); }}
                  style={{ width: '100%', borderRadius: 14, padding: '12px 8px', background: active ? 'rgba(var(--accent-rgb),0.12)' : 'var(--surface-inset-bg)', border: active ? '1px solid rgba(var(--accent-rgb),0.35)' : 'var(--border-panel)', color: active ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, transition: 'all 0.15s' }}>
                  <span style={{ fontSize: 22 }}>{getRoomEmoji(room)}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1, maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.name}</span>
                </button>
                {!active && (
                  <button onClick={e => { e.stopPropagation(); setRenamingRoomId(room.id); setRenameValue(room.name); }} title="Edit board"
                    style={{ position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: '50%', background: 'var(--surface-inset-bg)', border: 'var(--border-panel)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, zIndex: 10 }}>
                    <ChevronUp size={9} />
                  </button>
                )}
              </div>
            );
          })}
          {/* Add workspace */}
          <button onClick={() => setShowAddWs(true)}
            style={{ borderRadius: 14, padding: '12px 8px', background: 'var(--surface-inset-bg)', border: '1.5px dashed var(--dot-grid)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, transition: 'all 0.15s' }}>
            <span style={{ fontSize: 22 }}>＋</span>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1 }}>Add</span>
          </button>
        </div>
      ) : (
        /* Inline add form inside mobile panel */
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <button
              onClick={() => setEmojiPickerFor(emojiPickerFor === 'new' ? null : 'new')}
              style={{ width: 44, height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, lineHeight: 1, background: 'var(--surface-inset-bg)', border: 'var(--border-panel)', borderRadius: 10, cursor: 'pointer' }}
            >
              {newWsEmoji}
            </button>
            {emojiPickerFor === 'new' && renderCustomEmojiField((emoji) => setNewWsEmoji(emoji))}
            <input
              ref={wsInputRef}
              value={newWsName}
              onChange={e => setNewWsName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddWorkspace(); if (e.key === 'Escape') { setShowAddWs(false); setEmojiPickerFor(null); } }}
              placeholder="Board name..."
              autoFocus
              style={{ flex: 1, background: 'var(--surface-inset-bg)', border: 'var(--border-panel)', borderRadius: 10, padding: '8px 10px', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }}
            />
          </div>
          {emojiPickerFor === 'new' && renderEmojiPicker(
            (emoji) => { setNewWsEmoji(emoji); setEmojiPickerFor(null); },
            newWsEmoji,
            true
          )}
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleAddWorkspace} disabled={!newWsName.trim()}
              style={{ flex: 1, padding: '8px 0', borderRadius: 10, background: newWsName.trim() ? 'var(--accent-bright)' : 'var(--surface-inset-bg)', border: newWsName.trim() ? 'var(--border-panel)' : 'var(--border-panel)', color: newWsName.trim() ? '#0a0b16' : 'var(--text-muted)', cursor: newWsName.trim() ? 'pointer' : 'default', fontSize: 11, fontWeight: 700 }}>
              Add
            </button>
            <button onClick={() => { setShowAddWs(false); setEmojiPickerFor(null); }}
              style={{ flex: 1, padding: '8px 0', borderRadius: 10, background: 'var(--surface-inset-bg)', border: 'var(--border-panel)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // ── Tags panel ────────────────────────────────────────────────────────────
  const renderTagsPanel = () => (
    <div ref={tagsRef} style={{ ...panelStyle, minWidth: 200, maxWidth: Math.min(300, window.innerWidth - 32) }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Filter by tag</span>
        {hasActiveFilters && (
          <button onClick={() => { [...activeTagFilters].forEach(t => toggleTagFilter(t)); }} style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent-text)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
            <X size={10} /> Clear
          </button>
        )}
      </div>
      {allTags.length === 0 ? (
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0', margin: 0 }}>No tags yet</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {allTags.map(tag => {
            const active = activeTagFilters.includes(tag);
            return (
              <button key={tag} onClick={() => toggleTagFilter(tag)} style={{ padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: active ? 'rgba(var(--accent-rgb),0.15)' : 'var(--surface-inset-bg)', border: active ? '1px solid rgba(var(--accent-rgb),0.4)' : 'var(--border-panel)', color: active ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s', textTransform: 'uppercase' }}>
                {tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderSettingsPanel = () => (
    <div ref={settingsRef} style={{ ...panelStyle, minWidth: 260 }}>
      <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Settings</div>

      {/* Dossier menu row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-inset-bg)', padding: '10px 12px', borderRadius: 12, border: 'var(--border-panel)', cursor: 'pointer', marginBottom: 8 }}
        onClick={() => { setShowDossierModal(true); setShowSettings(false); }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FolderOpen size={16} color="var(--text-muted)" />
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 1 }}>Dossier</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 500 }}>
              {(() => { const d = dossiers.find((d: Dossier) => d.id === currentDossierId); return d ? `${d.name}` : 'Manage dossiers'; })()}
            </div>
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </div>

      {/* Share row — opens export modal */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-inset-bg)', padding: '10px 12px', borderRadius: 12, border: 'var(--border-panel)', cursor: 'pointer', marginBottom: 8 }}
        onClick={() => { const d = dossiers.find((d: Dossier) => d.id === currentDossierId); setExportNameValue(d?.name || 'Default'); setShowExportModal(true); }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Download size={16} color="var(--text-muted)" />
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 1 }}>Export</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 500 }}>Download dossier as .boardback file</div>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--surface-inset-bg)', marginBottom: 8 }} />

      {/* Theme selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-inset-bg)', padding: '10px 12px', borderRadius: 12, border: 'var(--border-panel)', marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>Theme</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {([
            { id: 'roadbow', label: 'Light', chip: '#ffffff', dot: '#fee347' },
            { id: 'midnight', label: 'Dark', chip: '#0d0e1a', dot: '#c8f135' },
          ] as const).map((t) => {
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                title={t.label}
                onClick={() => setTheme(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '5px 9px', borderRadius: 9,
                  background: t.chip,
                  border: isActive ? `2px solid ${t.dot}` : '2px solid var(--dot-grid)',
                  cursor: 'pointer', transition: 'all 0.15s',
                  boxShadow: isActive ? `0 0 0 3px ${t.dot}55` : 'none',
                }}
              >
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: t.dot, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: t.id === 'roadbow' ? '#1a1a1a' : '#ffffff' }}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'var(--surface-inset-bg)',
          padding: '10px 12px',
          borderRadius: 12,
          border: 'var(--border-panel)',
          cursor: 'pointer'
        }}
        onClick={() => setAutoOpenBookmarks(!autoOpenBookmarks)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ExternalLink size={16} color={autoOpenBookmarks ? 'var(--accent)' : 'var(--text-muted)'} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 1 }}>Open bookmark in new tab</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 500 }}>Click a preview to open it in a new browser tab</div>
          </div>
        </div>
        <div 
          style={{ 
            width: 40, 
            height: 18, 
            borderRadius: 20, 
            background: autoOpenBookmarks ? 'rgba(var(--accent-rgb),0.3)' : 'var(--surface-inset-bg)',
            border: autoOpenBookmarks ? '1px solid rgba(var(--accent-rgb),0.5)' : 'var(--border-panel)',
            position: 'relative',
            transition: 'all 0.2s',
            flexShrink: 0
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              marginTop: -6,
              left: autoOpenBookmarks ? 24 : 2,
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: autoOpenBookmarks ? 'var(--accent)' : 'var(--text-muted)',
              transition: 'all 0.2s'
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--surface-inset-bg)',
          padding: '10px 12px',
          borderRadius: 12,
          border: 'var(--border-panel)',
          cursor: extensionInstalled ? 'pointer' : 'default',
          marginTop: 8,
          opacity: extensionInstalled ? 1 : 0.45,
        }}
        onClick={extensionInstalled ? handleNewTabToggle : undefined}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={newTabEnabled ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 1 }}>Set as default new tab</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 500 }}>
              {extensionInstalled ? 'Replace new tab page with your board' : 'Requires the BoardBack extension'}
            </div>
            {newTabEnabled && /Vivaldi/i.test(navigator.userAgent) && (
              <div style={{ fontSize: 9, color: 'rgba(255,190,0,0.75)', fontWeight: 500, marginTop: 3 }}>
                Vivaldi: enable "Allow extensions to redirect New Tab" in Settings → Tabs
              </div>
            )}
          </div>
        </div>
        <div
          style={{
            width: 40,
            height: 18,
            borderRadius: 20,
            background: newTabEnabled ? 'rgba(var(--accent-rgb),0.3)' : 'var(--surface-inset-bg)',
            border: newTabEnabled ? '1px solid rgba(var(--accent-rgb),0.5)' : 'var(--border-panel)',
            position: 'relative',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              marginTop: -6,
              left: newTabEnabled ? 24 : 2,
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: newTabEnabled ? 'var(--accent)' : 'var(--text-muted)',
              transition: 'all 0.2s'
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderSearchPanel = () => (
    <div ref={searchRef} style={{ ...panelStyle, width: Math.min(320, window.innerWidth - 32) }}>
      <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Search</div>
      <input
        ref={searchInputRef}
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        onKeyDown={e => { if (e.key === 'Escape') { setShowSearch(false); setSearchQuery(''); } }}
        placeholder="Search bookmarks, notes, groups..."
        autoFocus
        style={{ width: '100%', background: 'var(--surface-inset-bg)', border: 'var(--border-panel)', borderRadius: 10, padding: '8px 10px', color: 'var(--text-primary)', fontSize: 12, outline: 'none', boxSizing: 'border-box', marginBottom: searchQuery.trim() ? 8 : 0 }}
      />
      {searchQuery.trim() && (
        <div style={{ maxHeight: 280, overflowY: 'auto' }}>
          {searchResults.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, padding: '16px 0' }}>No results found</div>
          ) : (
            searchResults.map(result => (
              <button key={`${result.id}-${result.roomId}`} onClick={() => handleSearchResultClick(result)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: 'var(--surface-inset-bg)', border: '1px solid transparent', cursor: 'pointer', textAlign: 'left', marginBottom: 4, transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-inset-bg)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--surface-inset-bg)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-inset-bg)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'; }}
              >
                <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: result.type === 'bookmark' ? 'rgba(59,130,246,0.15)' : result.type === 'note' ? 'rgba(168,85,247,0.15)' : 'rgba(34,197,94,0.15)' }}>
                  {result.type === 'bookmark' ? <ExternalLink size={13} color="#3b82f6" /> : result.type === 'note' ? <StickyNote size={13} color="#a855f7" /> : <Group size={13} color="#22c55e" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{result.title || 'Untitled'}</div>
                  {result.subtitle && <div style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>{result.subtitle}</div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: result.type === 'bookmark' ? 'rgba(59,130,246,0.7)' : result.type === 'note' ? 'rgba(168,85,247,0.7)' : 'rgba(34,197,94,0.7)' }}>{result.type}</span>
                  <span style={{ fontSize: 9, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{result.roomEmoji} {result.roomName}</span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );

  // ── Room right-click context menu (portal) ───────────────────────────────
  const roomCtxRoom = roomMenuPos ? rooms.find(r => r.id === roomMenuPos.roomId) : null;
  const roomContextMenu = roomMenuPos && roomCtxRoom && typeof document !== 'undefined' && createPortal(
    <div
      className="glass-dark"
      onMouseDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
      onContextMenu={e => e.preventDefault()}
      style={{ position: 'fixed', bottom: `calc(100vh - ${roomMenuPos.y}px + 25px)`, left: roomMenuPos.x, transform: 'translateX(-50%)', zIndex: 99999, border: 'var(--border-panel)', borderRadius: 16, boxShadow: 'var(--shadow-popover)', overflow: 'hidden', minWidth: 140 }}
    >
      {([
        { label: 'Edit', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>, action: () => { startRenaming(roomCtxRoom); setRoomMenuPos(null); setShowOverflow(false); }, danger: false, disabled: false },
        { divider: true },
        { label: 'Delete', icon: <Trash2 size={13} />, action: () => { setDeleteConfirm({ id: roomCtxRoom.id, name: roomCtxRoom.name }); setRoomMenuPos(null); }, danger: true, disabled: rooms.length <= 1 },
      ] as any[]).map((item: any, i: number) => {
        if (item.divider) return <div key={i} style={{ height: 1, background: 'var(--surface-inset-bg)', margin: '2px 0' }} />;
        return (
          <button key={item.label} onClick={item.action} disabled={item.disabled}
            className={item.danger ? 'text-red-400' : 'text-white/80'}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'transparent', border: 'none', fontSize: 13, cursor: item.disabled ? 'default' : 'pointer', opacity: item.disabled ? 0.3 : 1, textAlign: 'left', transition: 'background 0.15s' }}
            onMouseEnter={e => { if (!item.disabled) (e.currentTarget as HTMLButtonElement).style.background = item.danger ? 'rgba(239,68,68,0.15)' : 'var(--surface-inset-bg)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
            {item.icon}{item.label}
          </button>
        );
      })}
    </div>,
    document.body
  );

  // ── Delete confirmation modal ─────────────────────────────────────────────
  const deleteModal = deleteConfirm && (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(9,10,20,0.75)', backdropFilter: 'blur(12px)' }}
      onClick={() => setDeleteConfirm(null)}>
      <div style={{ background: 'var(--surface-panel-bg)', border: 'var(--border-panel)', borderRadius: 20, padding: '24px', width: 300, boxShadow: 'var(--shadow-panel)' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,60,60,0.12)', border: '1px solid rgba(255,60,60,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,100,100,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </div>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Delete board?</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>"{deleteConfirm.name}"</span> and all its content will be permanently removed.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setDeleteConfirm(null)}
            style={{ flex: 1, padding: '9px 0', borderRadius: 12, background: 'var(--surface-inset-bg)', border: 'var(--border-panel)', color: 'var(--text-muted)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={() => { deleteRoom(deleteConfirm.id); setDeleteConfirm(null); }}
            style={{ flex: 1, padding: '9px 0', borderRadius: 12, background: 'rgba(255,60,60,0.15)', border: '1px solid rgba(255,60,60,0.3)', color: '#ff6b6b', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  const dossierModal = showDossierModal && (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(9,10,20,0.75)', backdropFilter: 'blur(12px)' }}
      onClick={() => { setDossierMenuId(null); setFocusedDossierId(null); setRenamingDossierId(null); setRenameDossierValue(''); if (showAddDossier) { if (newDossierName.trim()) addDossier(newDossierName.trim(), '📁'); setShowAddDossier(false); setNewDossierName(''); } }}>
      <div style={{ background: 'var(--surface-panel-bg)', border: 'var(--border-panel)', borderRadius: 24, padding: '28px 28px 36px', width: 720, maxWidth: 'calc(100vw - 32px)', maxHeight: '80vh', overflowY: 'auto', boxShadow: 'var(--shadow-panel)' }}
        onClick={e => { e.stopPropagation(); setFocusedDossierId(null); setDossierMenuId(null); setRenamingDossierId(null); setRenameDossierValue(''); if (showAddDossier) { if (newDossierName.trim()) addDossier(newDossierName.trim(), '📁'); setShowAddDossier(false); setNewDossierName(''); } }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>Dossiers</div>
          <button onClick={() => { setShowDossierModal(false); setShowAddDossier(false); setNewDossierName(''); setEmojiPickerFor(null); setFocusedDossierId(null); setDossierMenuId(null); setRenamingDossierId(null); setRenameDossierValue(''); }}
            style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--surface-inset-bg)', border: 'var(--border-panel)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={14} />
          </button>
        </div>

        {/* File grid */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${isCompact ? 2 : isMobile ? 3 : 5}, 1fr)`, gap: 16, marginBottom: 45 }} onClick={() => { setDossierMenuId(null); setFocusedDossierId(null); setRenamingDossierId(null); setRenameDossierValue(''); }}>
          {dossiers.map((d: Dossier, idx: number) => {
            const cols = isCompact ? 2 : isMobile ? 3 : 5;
            const isLastCol = (idx + 1) % cols === 0;
            const isActive = d.id === currentDossierId;
            const isFocused = focusedDossierId === d.id && !isActive;
            const menuOpen = dossierMenuId === d.id;
            return (
              <div key={d.id} style={{ position: 'relative', minWidth: 0 }}
                onMouseEnter={e => { const btn = (e.currentTarget as HTMLDivElement).querySelector('.menu-btn') as HTMLElement; if (btn) btn.style.opacity = '1'; }}
                onMouseLeave={e => { const btn = (e.currentTarget as HTMLDivElement).querySelector('.menu-btn') as HTMLElement; if (btn && !menuOpen) btn.style.opacity = '0'; }}>
                {/* Card */}
                {renamingDossierId === d.id ? (
                  <div onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, height: 108, borderRadius: 16, background: 'var(--surface-inset-bg)', border: '1px dashed var(--dot-grid)', padding: '0 8px', boxSizing: 'border-box', overflow: 'hidden' }}>
                    <span style={{ fontSize: 40, lineHeight: 1, flexShrink: 0 }}>✏️</span>
                    <input
                      value={renameDossierValue}
                      onChange={e => setRenameDossierValue(e.target.value)}
                      autoFocus
                      onKeyDown={e => { if (e.key === 'Enter' && renameDossierValue.trim()) { updateDossierName(renamingDossierId, renameDossierValue.trim()); setRenamingDossierId(null); setRenameDossierValue(''); } if (e.key === 'Escape') { setRenamingDossierId(null); setRenameDossierValue(''); } }}
                      style={{ width: '100%', background: 'var(--surface-inset-bg)', border: 'var(--border-panel)', borderRadius: 7, padding: '4px 7px', color: 'var(--text-primary)', fontSize: 11, fontWeight: 600, outline: 'none', boxSizing: 'border-box', textAlign: 'center' }}
                    />
                  </div>
                ) : (
                  <div
                    onClick={e => { e.stopPropagation(); if (!isActive) setFocusedDossierId(d.id); }}
                    onDoubleClick={e => { e.stopPropagation(); if (!isActive) { switchDossier(d.id); setShowDossierModal(false); setFocusedDossierId(null); } }}
                    onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setDossierMenuId(menuOpen ? null : d.id); }}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, height: 108, borderRadius: 16,
                      background: isActive ? 'rgba(var(--accent-rgb),0.10)' : isFocused ? 'var(--surface-inset-bg)' : 'var(--surface-inset-bg)',
                      border: `1px solid ${isActive ? 'rgba(var(--accent-rgb),0.35)' : isFocused ? 'var(--text-muted)' : 'var(--surface-inset-bg)'}`,
                      boxShadow: isFocused ? '0 0 0 3px var(--accent-soft)' : 'none',
                      cursor: isActive ? 'default' : 'pointer', transition: 'all 0.15s', padding: '0 10px', boxSizing: 'border-box', overflow: 'hidden', userSelect: 'none',
                    }}
                    onMouseEnter={e => { if (!isActive && !isFocused) (e.currentTarget as HTMLDivElement).style.background = 'var(--surface-inset-bg)'; }}
                    onMouseLeave={e => { if (!isActive && !isFocused) (e.currentTarget as HTMLDivElement).style.background = 'var(--surface-inset-bg)'; }}>
                    <span style={{ fontSize: 40, lineHeight: 1, flexShrink: 0 }}>{isActive || isFocused ? '📂' : '📁'}</span>
                    <div style={{ fontSize: 12, fontWeight: 600, color: isActive ? 'var(--accent)' : isFocused ? 'var(--text-primary)' : 'var(--text-muted)', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>{d.name}</div>
                  </div>
                )}

                {/* ⋯ menu button + dropdown wrapper */}
                <div style={{ position: 'absolute', top: 6, right: 6 }}>
                  <button className="menu-btn"
                    onClick={e => { e.stopPropagation(); setDossierMenuId(menuOpen ? null : d.id); }}
                    style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--surface-inset-bg)', border: 'var(--border-panel)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, opacity: menuOpen ? 1 : 0, transition: 'opacity 0.15s' }}>
                    <MoreHorizontal size={12} />
                  </button>
                  {menuOpen && (
                    <div onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()} className="glass-dark" style={{ position: 'absolute', top: 26, ...(isLastCol ? { right: 0 } : { left: 0 }), zIndex: 10, border: 'var(--border-panel)', borderRadius: 16, boxShadow: 'var(--shadow-popover)', overflow: 'hidden', minWidth: 140 }}>
                      {[
                        { label: 'Open', icon: <FolderOpen size={13} />, action: () => { if (!isActive) { switchDossier(d.id); } setShowDossierModal(false); setDossierMenuId(null); }, disabled: false },
                        { label: 'Rename', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>, action: () => { setRenamingDossierId(d.id); setRenameDossierValue(d.name); setDossierMenuId(null); } },
                        { label: 'Duplicate', icon: <Copy size={13} />, action: () => { duplicateDossier(d.id); setDossierMenuId(null); } },
                        { label: 'Export', icon: <Download size={13} />, action: () => { const activeDossier = dossiers.find((dd: Dossier) => dd.id === currentDossierId); setExportNameValue(activeDossier?.name || 'Default'); setShowExportModal(true); setDossierMenuId(null); } },
                        { divider: true },
                        { label: 'Delete', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>, action: () => { setDeleteDossierConfirm({ id: d.id, name: d.name }); setDossierMenuId(null); }, danger: true, disabled: dossiers.length <= 1 },
                      ].map((item, i) => {
                        if ('divider' in item) return <div key={i} style={{ height: 1, background: 'var(--surface-inset-bg)', margin: '2px 0' }} />;
                        return (
                          <button key={item.label} onClick={item.action} disabled={item.disabled}
                            className={item.danger ? 'text-red-400' : 'text-white/80'}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'transparent', border: 'none', fontSize: 13, cursor: item.disabled ? 'default' : 'pointer', opacity: item.disabled ? 0.3 : 1, textAlign: 'left', transition: 'background 0.15s' }}
                            onMouseEnter={e => { if (!item.disabled) (e.currentTarget as HTMLButtonElement).style.background = item.danger ? 'rgba(239,68,68,0.15)' : 'var(--surface-inset-bg)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
                            {item.icon}{item.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {/* New dossier inline card */}
          {showAddDossier && (
            <div onClick={e => e.stopPropagation()} style={{ position: 'relative', minWidth: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, height: 108, borderRadius: 16, background: 'var(--surface-inset-bg)', border: '1px dashed var(--dot-grid)', padding: '0 8px', boxSizing: 'border-box', overflow: 'hidden' }}>
                <span style={{ fontSize: 40, lineHeight: 1, flexShrink: 0 }}>📁</span>
                <input
                  value={newDossierName}
                  onChange={e => setNewDossierName(e.target.value)}
                  autoFocus
                  onFocus={e => e.target.select()}
                  onKeyDown={e => { if (e.key === 'Enter') { if (newDossierName.trim()) addDossier(newDossierName.trim(), '📁'); setShowAddDossier(false); setNewDossierName(''); } if (e.key === 'Escape') { setShowAddDossier(false); setNewDossierName(''); } }}
                  style={{ width: '100%', background: 'var(--surface-inset-bg)', border: 'var(--border-panel)', borderRadius: 7, padding: '4px 7px', color: 'var(--text-primary)', fontSize: 11, fontWeight: 600, outline: 'none', boxSizing: 'border-box', textAlign: 'center' }}
                />
              </div>
            </div>
          )}
        </div>

        <input ref={importDossierRef} type="file" accept=".boardback" style={{ display: 'none' }} onChange={handleDossierImport} />

        {/* New and Import buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={e => { e.stopPropagation(); setShowAddDossier(true); setNewDossierName('New Dossier'); }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 0', borderRadius: 12, background: 'transparent', border: '1px dashed var(--dot-grid)', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-inset-bg)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}>
            <Plus size={14} strokeWidth={2} /> New Dossier
          </button>
          <button onClick={e => { e.stopPropagation(); importDossierRef.current?.click(); }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 0', borderRadius: 12, background: 'transparent', border: '1px dashed var(--dot-grid)', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-inset-bg)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}>
            <FolderDown size={14} strokeWidth={2} /> Import .boardback
          </button>
        </div>

      </div>
    </div>
  );

  const deleteDossierModal = deleteDossierConfirm && (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(9,10,20,0.75)', backdropFilter: 'blur(12px)' }}
      onClick={() => setDeleteDossierConfirm(null)}>
      <div style={{ background: 'var(--surface-panel-bg)', border: 'var(--border-panel)', borderRadius: 20, padding: '24px', width: 300, boxShadow: 'var(--shadow-panel)' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,60,60,0.12)', border: '1px solid rgba(255,60,60,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <FolderOpen size={18} color="rgba(255,100,100,0.9)" />
        </div>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Delete Dossier?</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>"{deleteDossierConfirm.name}"</span> and all its boards will be permanently removed.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setDeleteDossierConfirm(null)}
            style={{ flex: 1, padding: '9px 0', borderRadius: 12, background: 'var(--surface-inset-bg)', border: 'var(--border-panel)', color: 'var(--text-muted)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={() => { deleteDossier(deleteDossierConfirm.id); setDeleteDossierConfirm(null); }}
            style={{ flex: 1, padding: '9px 0', borderRadius: 12, background: 'rgba(255,60,60,0.15)', border: '1px solid rgba(255,60,60,0.3)', color: '#ff6b6b', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  const exportModal = showExportModal && (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(9,10,20,0.80)', backdropFilter: 'blur(12px)' }}
      onClick={() => setShowExportModal(false)}>
      <div style={{ background: 'var(--surface-panel-bg)', border: 'var(--border-panel)', borderRadius: 20, padding: 28, width: 360, maxWidth: 'calc(100vw - 32px)', boxShadow: 'var(--shadow-panel)' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Export Dossier</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
          Set a name for the exported dossier. The file will be downloaded as a <span style={{ color: 'var(--accent-text)', fontWeight: 600 }}>.boardback</span> file.
        </div>
        <input
          value={exportNameValue}
          onChange={e => setExportNameValue(e.target.value)}
          placeholder="Dossier name…"
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter' && exportNameValue.trim()) { exportDossier(exportNameValue.trim()); setShowExportModal(false); } if (e.key === 'Escape') setShowExportModal(false); }}
          style={{ width: '100%', background: 'var(--surface-inset-bg)', border: 'var(--border-panel)', borderRadius: 10, padding: '9px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowExportModal(false)}
            style={{ flex: 1, padding: '9px 0', borderRadius: 10, background: 'var(--surface-inset-bg)', border: 'var(--border-panel)', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
          <button disabled={!exportNameValue.trim()} onClick={() => { if (exportNameValue.trim()) { exportDossier(exportNameValue.trim()); setShowExportModal(false); } }}
            style={{ flex: 1, padding: '9px 0', borderRadius: 10, background: exportNameValue.trim() ? 'var(--accent-bright)' : 'var(--surface-inset-bg)', border: exportNameValue.trim() ? 'var(--border-panel)' : 'var(--border-panel)', color: exportNameValue.trim() ? '#0a0b16' : 'var(--text-muted)', fontSize: 12, fontWeight: 700, cursor: exportNameValue.trim() ? 'pointer' : 'default' }}>Export</button>
        </div>
      </div>
    </div>
  );

  const importModal = pendingImportDossier && (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(9,10,20,0.80)', backdropFilter: 'blur(12px)' }}
      onClick={() => setPendingImportDossier(null)}>
      <div style={{ background: 'var(--surface-panel-bg)', border: 'var(--border-panel)', borderRadius: 20, padding: 28, width: 360, maxWidth: 'calc(100vw - 32px)', boxShadow: 'var(--shadow-panel)' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Import Dossier</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
          Set a name for the imported dossier.
        </div>
        <input
          value={pendingImportName}
          onChange={e => setPendingImportName(e.target.value)}
          placeholder="Dossier name…"
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter' && pendingImportName.trim()) { commitImportDossier(pendingImportDossier, pendingImportName.trim()); setPendingImportDossier(null); } if (e.key === 'Escape') setPendingImportDossier(null); }}
          style={{ width: '100%', background: 'var(--surface-inset-bg)', border: 'var(--border-panel)', borderRadius: 10, padding: '9px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setPendingImportDossier(null)}
            style={{ flex: 1, padding: '9px 0', borderRadius: 10, background: 'var(--surface-inset-bg)', border: 'var(--border-panel)', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
          <button disabled={!pendingImportName.trim()} onClick={() => { if (pendingImportName.trim()) { commitImportDossier(pendingImportDossier!, pendingImportName.trim()); setPendingImportDossier(null); } }}
            style={{ flex: 1, padding: '9px 0', borderRadius: 10, background: pendingImportName.trim() ? 'var(--accent-bright)' : 'var(--surface-inset-bg)', border: pendingImportName.trim() ? 'var(--border-panel)' : 'var(--border-panel)', color: pendingImportName.trim() ? '#0a0b16' : 'var(--text-muted)', fontSize: 12, fontWeight: 700, cursor: pendingImportName.trim() ? 'pointer' : 'default' }}>Import</button>
        </div>
      </div>
    </div>
  );

  // ── Compact mode (< 400px) ────────────────────────────────────────────────
  if (isCompact) {
    const menuItems = [
      { icon: <Search size={18} strokeWidth={2} />, label: 'Search', action: () => { setShowSearch(v => !v); setShowMenu(false); setShowSettings(false); setShowTags(false); }, active: showSearch },
      { icon: <StickyNote size={18} strokeWidth={2} />, label: 'Sticker', action: () => { handleAddSticker(); setShowMenu(false); setShowSettings(false); } },
      { icon: <Group size={18} strokeWidth={2} />, label: 'Group', action: () => { handleAddGroup(); setShowMenu(false); setShowSettings(false); } },
      { icon: <Tag size={18} strokeWidth={2} />, label: 'Tags', action: () => { setShowTags(v => !v); setShowMenu(false); setShowSettings(false); }, active: hasActiveFilters },
      { icon: <Wand2 size={18} strokeWidth={2} />, label: 'Arrange', action: () => { autoArrange(); setTimeout(() => fitView({ duration: 0, padding: 0.5, maxZoom: 1 }), 50); setShowMenu(false); setShowSettings(false); } },
      { icon: <Settings size={18} strokeWidth={2} />, label: 'Settings', action: () => { setShowSettings(v => !v); setShowMenu(false); setShowTags(false); }, active: showSettings },
    ];

    return (
      <>
      {roomContextMenu}
      {deleteModal}
      {deleteDossierModal}
      {dossierModal}
      {exportModal}
      {importModal}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-100" style={{ userSelect: 'none' }}>
        <div className="relative" ref={menuRef}>
          {showSearch && renderSearchPanel()}
          {showTags && renderTagsPanel()}
          {showSettings && renderSettingsPanel()}
          {showRooms && renderRoomsPanel(220)}
          {showMenu && (
            <div style={{ ...panelStyle, width: Math.min(240, window.innerWidth - 32) }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {menuItems.map((item) => (
                  <button key={item.label} onClick={item.action}
                    style={{ borderRadius: 14, padding: '10px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: item.active ? 'rgba(var(--accent-rgb),0.12)' : 'var(--surface-inset-bg)', border: item.active ? '1px solid rgba(var(--accent-rgb),0.35)' : 'var(--border-panel)', color: item.active ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {item.icon}
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 10px', background: 'var(--surface-pill-bg)', backdropFilter: 'var(--surface-blur)', WebkitBackdropFilter: 'var(--surface-blur)', border: 'var(--border-panel)', borderRadius: 40, boxShadow: 'var(--shadow-pill)', height: 60, animation: 'pillFloat 5s ease-in-out infinite' }}>
            <button ref={roomsBtnRef} onClick={() => { setShowRooms(v => !v); setShowMenu(false); setShowTags(false); setShowAddWs(false); setEmojiPickerFor(null); setShowSettings(false); }}
              style={{ width: 34, height: 34, borderRadius: 12, background: showRooms ? 'rgba(var(--accent-rgb),0.12)' : 'transparent', border: 'none', color: showRooms ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s', fontSize: 20 }}>
              {currentRoom ? getRoomEmoji(currentRoom) : '📌'}
            </button>
            <button onClick={undo} disabled={!canUndo}
              style={{ width: 30, height: 30, borderRadius: 10, background: 'transparent', border: 'none', color: canUndo ? 'var(--text-muted)' : 'var(--surface-inset-bg)', cursor: canUndo ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Undo2 size={16} strokeWidth={2} />
            </button>
            <button onClick={redo} disabled={!canRedo}
              style={{ width: 30, height: 30, borderRadius: 10, background: 'transparent', border: 'none', color: canRedo ? 'var(--text-muted)' : 'var(--surface-inset-bg)', cursor: canRedo ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Redo2 size={16} strokeWidth={2} />
            </button>
            <div style={{ width: 1, height: 28, background: 'var(--surface-inset-bg)', flexShrink: 0 }} />
            <button onClick={handleAddBookmark}
              style={{ width: 40, height: 40, borderRadius: 14, background: 'var(--accent-bright)', color: '#0a0b16', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-fab)', border: 'var(--border-panel)', cursor: 'pointer', flexShrink: 0 }}>
              <Plus size={20} strokeWidth={2.5} />
            </button>
            <div style={{ width: 1, height: 28, background: 'var(--surface-inset-bg)', flexShrink: 0 }} />
            <button onClick={() => { setShowMenu(v => !v); setShowRooms(false); setShowTags(false); setShowSettings(false); setShowSearch(false); setSearchQuery(''); }} onMouseDown={e => e.stopPropagation()}
              style={{ width: 34, height: 34, borderRadius: 12, background: showMenu ? 'rgba(var(--accent-rgb),0.12)' : 'transparent', border: 'none', color: showMenu ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Menu size={18} strokeWidth={2} />
              {hasActiveFilters && <span style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', border: '1.5px solid rgba(10,11,22,0.9)' }} />}
            </button>
          </div>
        </div>
      </div>
      </>
    );
  }

  // ── Mobile layout (400–540px) ─────────────────────────────────────────────
  if (isMobile) {
    const mobileMenuItems = [
      { icon: <Search size={18} strokeWidth={2} />, label: 'Search', action: () => { setShowSearch(v => !v); setShowMenu(false); setShowSettings(false); setShowTags(false); }, active: showSearch },
      { icon: <StickyNote size={18} strokeWidth={2} />, label: 'Sticker', action: () => { handleAddSticker(); setShowMenu(false); setShowSettings(false); } },
      { icon: <Group size={18} strokeWidth={2} />, label: 'Group', action: () => { handleAddGroup(); setShowMenu(false); setShowSettings(false); } },
      { icon: <Tag size={18} strokeWidth={2} />, label: 'Tags', action: () => { setShowTags(v => !v); setShowMenu(false); setShowSettings(false); }, active: hasActiveFilters },
      { icon: <Wand2 size={18} strokeWidth={2} />, label: 'Arrange', action: () => { autoArrange(); setTimeout(() => fitView({ duration: 0, padding: 0.5, maxZoom: 1 }), 50); setShowMenu(false); setShowSettings(false); } },
      { icon: <Settings size={18} strokeWidth={2} />, label: 'Settings', action: () => { setShowSettings(v => !v); setShowMenu(false); setShowTags(false); }, active: showSettings },
    ];

    return (
      <>
      {roomContextMenu}
      {deleteModal}
      {deleteDossierModal}
      {dossierModal}
      {exportModal}
      {importModal}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-100" style={{ userSelect: 'none' }}>
        <div className="relative" ref={menuRef}>
          {showSearch && renderSearchPanel()}
          {showTags && renderTagsPanel()}
          {showSettings && renderSettingsPanel()}
          {showRooms && renderRoomsPanel(240)}
          {showMenu && (
            <div style={{ ...panelStyle, width: Math.min(240, window.innerWidth - 32) }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {mobileMenuItems.map((item) => (
                  <button key={item.label} onClick={item.action}
                    style={{ borderRadius: 14, padding: '10px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: item.active ? 'rgba(var(--accent-rgb),0.12)' : 'var(--surface-inset-bg)', border: item.active ? '1px solid rgba(var(--accent-rgb),0.35)' : 'var(--border-panel)', color: item.active ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {item.icon}
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', background: 'var(--surface-pill-bg)', backdropFilter: 'var(--surface-blur)', WebkitBackdropFilter: 'var(--surface-blur)', border: 'var(--border-panel)', borderRadius: 40, boxShadow: 'var(--shadow-pill)', height: 60, animation: 'pillFloat 5s ease-in-out infinite' }}>
            <button ref={roomsBtnRef} onClick={() => { setShowRooms(v => !v); setShowMenu(false); setShowTags(false); setShowAddWs(false); setEmojiPickerFor(null); setShowSettings(false); }}
              style={{ width: 36, height: 36, borderRadius: 13, background: showRooms ? 'rgba(var(--accent-rgb),0.12)' : 'transparent', border: 'none', color: showRooms ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              {currentRoom ? getRoomEmoji(currentRoom) : '📌'}
            </button>
            <div style={{ width: 1, height: 28, background: 'var(--surface-inset-bg)', flexShrink: 0 }} />
            <button onClick={undo} disabled={!canUndo}
              style={{ width: 34, height: 34, borderRadius: 11, background: 'transparent', border: 'none', color: canUndo ? 'var(--text-muted)' : 'var(--surface-inset-bg)', cursor: canUndo ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Undo2 size={18} strokeWidth={2} />
            </button>
            <button onClick={redo} disabled={!canRedo}
              style={{ width: 34, height: 34, borderRadius: 11, background: 'transparent', border: 'none', color: canRedo ? 'var(--text-muted)' : 'var(--surface-inset-bg)', cursor: canRedo ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Redo2 size={18} strokeWidth={2} />
            </button>
            <div style={{ width: 1, height: 28, background: 'var(--surface-inset-bg)', flexShrink: 0 }} />
            <button onClick={handleAddBookmark}
              style={{ width: 44, height: 44, borderRadius: 16, background: 'var(--accent-bright)', color: '#0a0b16', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-fab)', border: 'var(--border-panel)', cursor: 'pointer', flexShrink: 0 }}>
              <Plus size={22} strokeWidth={2.5} />
            </button>
            <div style={{ width: 1, height: 28, background: 'var(--surface-inset-bg)', flexShrink: 0 }} />
            <button onClick={() => { setShowMenu(v => !v); setShowRooms(false); setShowTags(false); setShowSettings(false); setShowSearch(false); setSearchQuery(''); }} onMouseDown={e => e.stopPropagation()}
              style={{ width: 38, height: 38, borderRadius: 13, background: showMenu ? 'rgba(var(--accent-rgb),0.12)' : 'transparent', border: 'none', color: showMenu ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Menu size={20} strokeWidth={2} />
              {hasActiveFilters && <span style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', border: '1.5px solid rgba(10,11,22,0.9)' }} />}
            </button>
          </div>
        </div>
      </div>
      </>
    );
  }

  // ── Desktop layout ────────────────────────────────────────────────────────
  return (
    <>
    {roomContextMenu}
      {deleteModal}
    {deleteDossierModal}
    {dossierModal}
    {exportModal}
    {importModal}
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-100" style={{ maxWidth: 'calc(100vw - 2rem)', userSelect: 'none' }}>
      <div className="flex items-center"
        style={{ gap: 8, padding: '0 16px', animation: 'pillFloat 5s ease-in-out infinite', background: 'var(--surface-pill-bg)', backdropFilter: 'var(--surface-blur)', WebkitBackdropFilter: 'var(--surface-blur)', border: 'var(--border-panel)', borderRadius: '40px', boxShadow: 'var(--shadow-pill)', height: 76 }}>

        {/* ── Boards ─────────────────────────────────────────────────── */}
        {maxInlineRooms === 0 ? (
          /* 540–640px: single dropdown */
          <div className="relative" ref={roomsRef}>
            {showRooms && (
              <div style={{ ...panelStyle, width: Math.min(230, window.innerWidth - 32) }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, paddingLeft: 2 }}>Boards</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  {rooms.map(room => {
                    const active = room.id === currentRoomId;
                    const isDragging = room.id === draggedRoomId;
                    return (
                      <div key={room.id}
                        style={{ position: 'relative', opacity: isDragging ? 0.3 : 1, transition: 'all 0.2s cubic-bezier(.34,1.56,.64,1)', transform: isDragging ? 'scale(0.95)' : 'scale(1)', cursor: 'grab' }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, room.id)}
                        onDragOver={(e) => handleDragOver(e, room.id)}
                        onDragEnd={handleDragEnd}
                      >
                        <button onClick={() => { switchRoom(room.id); setShowRooms(false); }}
                          style={{ width: '100%', borderRadius: 14, padding: '12px 8px', background: active ? 'rgba(var(--accent-rgb),0.12)' : 'var(--surface-inset-bg)', border: active ? '1px solid rgba(var(--accent-rgb),0.35)' : 'var(--border-panel)', color: active ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, transition: 'all 0.15s' }}>
                          <span style={{ fontSize: 22 }}>{getRoomEmoji(room)}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1 }}>{room.name}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
                {/* Add workspace inline */}
                {!showAddWs ? (
                  <button onClick={() => setShowAddWs(true)}
                    style={{ width: '100%', padding: '9px 0', borderRadius: 12, background: 'var(--surface-inset-bg)', border: '1.5px dashed var(--dot-grid)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11, fontWeight: 700, transition: 'all 0.15s' }}>
                    <LayersPlus size={14} strokeWidth={2} /> New
                  </button>
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <button onClick={() => setEmojiPickerFor(emojiPickerFor === 'new' ? null : 'new')}
                        style={{ width: 44, height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, background: 'var(--surface-inset-bg)', border: 'var(--border-panel)', borderRadius: 10, cursor: 'pointer', lineHeight: 1 }}>
                        {newWsEmoji}
                      </button>
                      {emojiPickerFor === 'new' && renderCustomEmojiField((emoji) => setNewWsEmoji(emoji))}
                      <input ref={wsInputRef} value={newWsName} onChange={e => setNewWsName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleAddWorkspace(); if (e.key === 'Escape') { setShowAddWs(false); setEmojiPickerFor(null); } }}
                        placeholder="Board name..."
                        autoFocus
                        style={{ flex: 1, background: 'var(--surface-inset-bg)', border: 'var(--border-panel)', borderRadius: 10, padding: '7px 9px', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }}
                      />
                    </div>
                    {emojiPickerFor === 'new' && renderEmojiPicker(
                      (emoji) => { setNewWsEmoji(emoji); setEmojiPickerFor(null); },
                      newWsEmoji,
                      true
                    )}
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={handleAddWorkspace} disabled={!newWsName.trim()}
                        style={{ flex: 1, padding: '7px 0', borderRadius: 9, background: newWsName.trim() ? 'var(--accent-bright)' : 'var(--surface-inset-bg)', border: newWsName.trim() ? 'var(--border-panel)' : 'var(--border-panel)', color: newWsName.trim() ? '#0a0b16' : 'var(--text-muted)', cursor: newWsName.trim() ? 'pointer' : 'default', fontSize: 11, fontWeight: 700 }}>Add</button>
                      <button onClick={() => { setShowAddWs(false); setEmojiPickerFor(null); }}
                        style={{ flex: 1, padding: '7px 0', borderRadius: 9, background: 'var(--surface-inset-bg)', border: 'var(--border-panel)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex flex-col items-center justify-center" style={{ margin: '0 12px' }}>
              <button ref={roomsBtnRef} onClick={() => setShowRooms(v => !v)}
                style={{ width: 44, height: 36, borderRadius: 13, background: showRooms ? 'rgba(var(--accent-rgb),0.12)' : 'transparent', border: 'none', color: showRooms ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, position: 'relative', top: '-5px' }}>
                {currentRoom ? getRoomEmoji(currentRoom) : '📌'}
              </button>
              <span style={{ fontSize: 9, fontWeight: 700, color: showRooms ? 'var(--accent-text)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', userSelect: 'none', lineHeight: 1, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                {currentRoom?.name}
              </span>
            </div>
          </div>
        ) : (
          /* ≥640px: inline workspace tabs */
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {visibleRooms.map(room => {
              const active = room.id === currentRoomId;
              const pickerOpen = emojiPickerFor === room.id;
              return (
                /* emojiPickerRef attached to the tab container while edit panel is open,
                   so outside-click doesn't fire when clicking within the tab */
                <div
                  key={room.id}
                  ref={renamingRoomId === room.id ? emojiPickerRef : undefined}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    margin: '0 2px',
                    transition: 'all 0.2s cubic-bezier(.34,1.56,.64,1)',
                    transform: room.id === draggedRoomId ? 'scale(0.95)' : 'scale(1)',
                    cursor: 'grab'
                  }}
                  data-room-wrapper=""
                  onMouseEnter={() => setHoveredRoomId(room.id)}
                  onMouseLeave={() => setHoveredRoomId(null)}
                  onContextMenu={e => { e.preventDefault(); if (renamingRoomId === room.id) return; if (roomMenuPos?.roomId === room.id) { setRoomMenuPos(null); return; } const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setRoomMenuPos({ x: r.left + r.width / 2, y: r.top, roomId: room.id }); }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, room.id)}
                  onDragOver={(e) => handleDragOver(e, room.id)}
                  onDragEnd={handleDragEnd}
                >
                  {/* Edit-room panel — rename + emoji change */}
                  {renamingRoomId === room.id && (
                    <div style={{ ...panelStyle, minWidth: 230 }}>
                      <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
                        Edit board
                      </div>
                      {/* Emoji selector */}
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button
                            onClick={() => setEmojiPickerFor(pickerOpen ? null : room.id)}
                            style={{ width: 44, height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12, background: pickerOpen ? 'rgba(var(--accent-rgb),0.10)' : 'var(--surface-inset-bg)', border: pickerOpen ? '1px solid rgba(var(--accent-rgb),0.3)' : 'var(--border-panel)', cursor: 'pointer', transition: 'all 0.15s' }}
                          >
                            <span style={{ fontSize: 22, lineHeight: 1 }}>{getRoomEmoji(room)}</span>
                          </button>
                          {pickerOpen && renderCustomEmojiField((emoji) => updateRoomEmoji(room.id, emoji))}
                        </div>
                        {pickerOpen && renderEmojiPicker(
                          (emoji) => { updateRoomEmoji(room.id, emoji); setEmojiPickerFor(null); },
                          getRoomEmoji(room),
                          true
                        )}
                      </div>
                      {/* Name input */}
                      <div style={{ display: 'flex', gap: 7 }}>
                        <input
                          ref={renameInputRef}
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') { commitRename(); setEmojiPickerFor(null); setRenamingRoomId(null); }
                            if (e.key === 'Escape') { setRenamingRoomId(null); setRenameValue(''); setEmojiPickerFor(null); }
                          }}
                          placeholder="Board name..."
                          style={{ flex: 1, background: 'var(--surface-inset-bg)', border: 'var(--border-panel)', borderRadius: 10, padding: '8px 10px', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }}
                        />
                        <button
                          onClick={() => { commitRename(); setEmojiPickerFor(null); setRenamingRoomId(null); }}
                          disabled={!renameValue.trim()}
                          style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 10, background: renameValue.trim() ? 'var(--accent-bright)' : 'var(--surface-inset-bg)', border: renameValue.trim() ? 'var(--border-panel)' : 'var(--border-panel)', color: renameValue.trim() ? '#0a0b16' : 'var(--text-muted)', cursor: renameValue.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                        >
                          <Check size={15} strokeWidth={2.5} />
                        </button>
                      </div>
                      {/* Delete board */}
                      {rooms.length > 1 && (
                        <button
                          onClick={() => { setRenamingRoomId(null); setEmojiPickerFor(null); setDeleteConfirm({ id: room.id, name: room.name }); }}
                          style={{ marginTop: 10, width: '100%', padding: '7px 0', borderRadius: 10, background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)', color: 'rgba(255,100,100,0.85)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,60,60,0.15)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,60,60,0.4)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,60,60,0.08)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,60,60,0.2)'; }}
                        >
                          <Trash2 size={13} strokeWidth={2} />
                          Delete board
                        </button>
                      )}
                    </div>
                  )}
                  {/* Tab button wrapper — keeps delete button anchored to emoji button */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => {
                        if (roomMenuPos?.roomId === room.id) { setRoomMenuPos(null); return; }
                        if (active) {
                          if (renamingRoomId === room.id) {
                            commitRename();
                            setRenamingRoomId(null);
                            setEmojiPickerFor(null);
                          } else {
                            startRenaming(room);
                          }
                        } else {
                          switchRoom(room.id);
                          setRenamingRoomId(null);
                          setEmojiPickerFor(null);
                          setShowOverflow(false);
                        }
                      }}
                      title={active ? 'Edit board' : room.name}
                      style={{ width: 44, height: 36, borderRadius: 13, background: active ? 'rgba(var(--accent-rgb),0.12)' : 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: active ? 22 : 20, transition: 'all 0.18s', position: 'relative', top: '-5px', filter: active ? 'none' : 'grayscale(0.2) opacity(0.7)' }}
                      onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.filter = 'none'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-inset-bg)'; } }}
                      onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.filter = 'grayscale(0.2) opacity(0.7)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; } }}
                    >
                      {getRoomEmoji(room)}
                    </button>
                    {/* Edit button — shown on hover for non-active rooms */}
                    {!active && (hoveredRoomId === room.id || roomMenuPos?.roomId === room.id) && (
                      <button
                        onMouseDown={e => e.stopPropagation()}
                        onClick={e => { e.stopPropagation(); if (renamingRoomId === room.id) return; const tabEl = (e.currentTarget as HTMLButtonElement).closest('[data-room-wrapper]') as HTMLElement; const r = (tabEl || (e.currentTarget as HTMLButtonElement).parentElement!.parentElement!).getBoundingClientRect(); setRoomMenuPos(p => p?.roomId === room.id ? null : { x: r.left + r.width / 2, y: r.top, roomId: room.id }); }}
                        title="Board options"
                        style={{ position: 'absolute', top: -5, right: -5, width: 16, height: 16, borderRadius: '50%', background: 'var(--surface-inset-bg)', border: 'var(--border-panel)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
                      >
                        {roomMenuPos?.roomId === room.id ? <ChevronDown size={8} /> : <ChevronUp size={8} />}
                      </button>
                    )}
                  </div>
                  <span style={{ ...labelStyle, color: active ? 'var(--accent-text)' : 'var(--text-muted)', maxWidth: 72 }}>
                    {room.name.length > 11 ? room.name.slice(0, 10) + '…' : room.name}
                  </span>

                </div>
              );
            })}

            {/* Overflow menu */}
            {overflowRooms.length > 0 && (
              <div className="relative" ref={overflowRef} style={{ margin: '0 2px' }}
                onMouseEnter={() => { if (renamingRoomId && overflowRooms.some(r => r.id === renamingRoomId)) return; if (overflowCloseTimer.current) clearTimeout(overflowCloseTimer.current); setShowOverflow(true); }}
                onMouseLeave={() => { if (renamingRoomId && overflowRooms.some(r => r.id === renamingRoomId)) return; if (roomMenuPos) return; overflowCloseTimer.current = setTimeout(() => setShowOverflow(false), 150); }}
              >
                {/* Edit panel for overflow rooms — shown instead of overflow list */}
                {renamingRoomId && overflowRooms.some(r => r.id === renamingRoomId) && (() => {
                  const room = overflowRooms.find(r => r.id === renamingRoomId)!;
                  const pickerOpen = emojiPickerFor === room.id;
                  return (
                    <div style={{ ...panelStyle, minWidth: 230 }}>
                      <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
                        Edit board
                      </div>
                      {/* Emoji selector */}
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button
                            onClick={() => setEmojiPickerFor(pickerOpen ? null : room.id)}
                            style={{ width: 44, height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12, background: pickerOpen ? 'rgba(var(--accent-rgb),0.10)' : 'var(--surface-inset-bg)', border: pickerOpen ? '1px solid rgba(var(--accent-rgb),0.3)' : 'var(--border-panel)', cursor: 'pointer', transition: 'all 0.15s' }}
                          >
                            <span style={{ fontSize: 22, lineHeight: 1 }}>{getRoomEmoji(room)}</span>
                          </button>
                          {pickerOpen && renderCustomEmojiField((emoji) => updateRoomEmoji(room.id, emoji))}
                        </div>
                        {pickerOpen && renderEmojiPicker(
                          (emoji) => { updateRoomEmoji(room.id, emoji); setEmojiPickerFor(null); },
                          getRoomEmoji(room),
                          true
                        )}
                      </div>
                      {/* Name input */}
                      <div style={{ display: 'flex', gap: 7 }}>
                        <input
                          ref={renameInputRef}
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') { commitRename(); setEmojiPickerFor(null); setRenamingRoomId(null); }
                            if (e.key === 'Escape') { setRenamingRoomId(null); setRenameValue(''); setEmojiPickerFor(null); }
                          }}
                          placeholder="Board name..."
                          style={{ flex: 1, background: 'var(--surface-inset-bg)', border: 'var(--border-panel)', borderRadius: 10, padding: '8px 10px', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }}
                        />
                        <button
                          onClick={() => { commitRename(); setEmojiPickerFor(null); setRenamingRoomId(null); }}
                          disabled={!renameValue.trim()}
                          style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 10, background: renameValue.trim() ? 'var(--accent-bright)' : 'var(--surface-inset-bg)', border: renameValue.trim() ? 'var(--border-panel)' : 'var(--border-panel)', color: renameValue.trim() ? '#0a0b16' : 'var(--text-muted)', cursor: renameValue.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                        >
                          <Check size={15} strokeWidth={2.5} />
                        </button>
                      </div>
                      {/* Delete board */}
                      {rooms.length > 1 && (
                        <button
                          onClick={() => { setRenamingRoomId(null); setEmojiPickerFor(null); setDeleteConfirm({ id: room.id, name: room.name }); }}
                          style={{ marginTop: 10, width: '100%', padding: '7px 0', borderRadius: 10, background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)', color: 'rgba(255,100,100,0.85)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,60,60,0.15)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,60,60,0.4)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,60,60,0.08)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,60,60,0.2)'; }}
                        >
                          <Trash2 size={13} strokeWidth={2} />
                          Delete board
                        </button>
                      )}
                    </div>
                  );
                })()}
                {showOverflow && (
                  <div style={{ ...panelStyle, minWidth: 190 }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, paddingLeft: 2 }}>Other boards</div>
                    {overflowRooms.map(room => {
                      const active = room.id === currentRoomId;
                      return (
                        <div key={room.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            marginBottom: 3,
                            opacity: room.id === draggedRoomId ? 0.3 : 1,
                            transition: 'all 0.2s cubic-bezier(.34,1.56,.64,1)',
                            transform: room.id === draggedRoomId ? 'scale(0.95)' : 'scale(1)',
                            cursor: 'grab'
                          }}
                          draggable
                          onDragStart={(e) => handleDragStart(e, room.id)}
                          onDragOver={(e) => handleDragOver(e, room.id)}
                          onDragEnd={handleDragEnd}
                        >
                          <button onClick={() => { switchRoom(room.id); setShowOverflow(false); }}
                            style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: active ? 'rgba(var(--accent-rgb),0.12)' : 'var(--surface-inset-bg)', border: active ? '1px solid rgba(var(--accent-rgb),0.35)' : '1px solid transparent', color: active ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s', fontSize: 12, fontWeight: 600, textAlign: 'left' }}
                            onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-inset-bg)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; } }}
                            onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-inset-bg)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; } }}
                          >
                            <span style={{ fontSize: 18 }}>{getRoomEmoji(room)}</span>
                            {room.name}
                          </button>
                          {/* Menu button */}
                          <button
                            onClick={e => { e.stopPropagation(); if (overflowCloseTimer.current) clearTimeout(overflowCloseTimer.current); const r = (e.currentTarget as HTMLButtonElement).getBoundingClientRect(); setRoomMenuPos(p => p?.roomId === room.id ? null : { x: r.right, y: r.top, roomId: room.id }); }}
                            title="Board options"
                            style={{ width: 26, height: 26, flexShrink: 0, borderRadius: 7, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-inset-bg)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
                          >
                            <MoreHorizontal size={13} strokeWidth={2} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="flex flex-col items-center justify-center">
                  <button onClick={() => {
                    const isEditingOverflow = renamingRoomId && overflowRooms.some(r => r.id === renamingRoomId);
                    if (isEditingOverflow) {
                      commitRename();
                      setRenamingRoomId(null);
                      setEmojiPickerFor(null);
                    }
                    setShowOverflow(v => !v);
                  }}
                    style={{ width: 44, height: 36, borderRadius: 13, background: (showOverflow || overflowRooms.some(r => r.id === currentRoomId) || (renamingRoomId != null && overflowRooms.some(r => r.id === renamingRoomId))) ? 'rgba(var(--accent-rgb),0.12)' : 'transparent', border: 'none', color: (showOverflow || overflowRooms.some(r => r.id === currentRoomId) || (renamingRoomId != null && overflowRooms.some(r => r.id === renamingRoomId))) ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s', position: 'relative', top: '-5px' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(var(--accent-rgb),0.12)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)'; }}
                    onMouseLeave={e => { const isActive = showOverflow || overflowRooms.some(r => r.id === currentRoomId) || (renamingRoomId != null && overflowRooms.some(r => r.id === renamingRoomId)); (e.currentTarget as HTMLButtonElement).style.background = isActive ? 'rgba(var(--accent-rgb),0.12)' : 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = isActive ? 'var(--accent)' : 'var(--text-muted)'; }}
                  >
                    {(() => { const activeOverflow = overflowRooms.find(r => r.id === currentRoomId); return activeOverflow ? <span style={{ fontSize: 20, lineHeight: 1 }}>{getRoomEmoji(activeOverflow)}</span> : <MoreHorizontal size={18} strokeWidth={2} />; })()}
                  </button>
                  <span style={{ ...labelStyle, color: (showOverflow || overflowRooms.some(r => r.id === currentRoomId) || (renamingRoomId != null && overflowRooms.some(r => r.id === renamingRoomId))) ? 'var(--accent-text)' : 'var(--text-muted)' }}>More</span>
                </div>
              </div>
            )}

            {/* Add workspace */}
            <div className="relative" style={{ margin: '0 2px' }}>
              {showAddWs && renderAddWsPanel()}
              <div className="flex flex-col items-center justify-center">
                <button
                  ref={addWsBtnRef}
                  onClick={() => { setShowAddWs(v => !v); setEmojiPickerFor(null); }}
                  style={{ width: 44, height: 36, borderRadius: 13, background: showAddWs ? 'rgba(var(--accent-rgb),0.12)' : 'transparent', border: 'none', color: showAddWs ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s', position: 'relative', top: '-5px' }}
                  onMouseEnter={e => { if (!showAddWs) { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-inset-bg)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; } }}
                  onMouseLeave={e => { if (!showAddWs) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; } }}
                >
                  <LayersPlus size={16} strokeWidth={2.5} />
                </button>
                <span style={labelStyle}>New</span>
              </div>
            </div>
          </div>
        )}

        <div style={{ width: 1, height: 36, background: 'var(--surface-inset-bg)', flexShrink: 0 }} />

        {/* Undo / Redo */}
        {[
          { icon: <Undo2 size={18} strokeWidth={2} />, action: undo, enabled: canUndo, label: '⌘Z' },
          { icon: <Redo2 size={18} strokeWidth={2} />, action: redo, enabled: canRedo, label: '⌘⇧Z' },
        ].map((item) => (
          <button key={item.label} onClick={item.action} disabled={!item.enabled} title={item.label}
            style={{ width: 36, height: 36, borderRadius: 10, background: 'transparent', border: 'none', color: item.enabled ? 'var(--text-muted)' : 'var(--surface-inset-bg)', cursor: item.enabled ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
            onMouseEnter={e => { if (!item.enabled) return; (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-inset-bg)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = item.enabled ? 'var(--text-muted)' : 'var(--surface-inset-bg)'; }}
          >
            {item.icon}
          </button>
        ))}

        <div style={{ width: 1, height: 36, background: 'var(--surface-inset-bg)', flexShrink: 0 }} />

        {/* Primary + bookmark */}
        <button onClick={handleAddBookmark}
          style={{ width: 52, height: 52, borderRadius: 18, background: 'var(--accent-bright)', color: '#0a0b16', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-fab)', border: 'var(--border-panel)', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s cubic-bezier(.34,1.56,.64,1)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.12)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-fab)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-fab)'; }}
          onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.94)'; }}
          onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.12)'; }}
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>

        <div style={{ width: 1, height: 36, background: 'var(--surface-inset-bg)', flexShrink: 0 }} />

        {/* Sticker */}
        <div className="flex flex-col items-center justify-center">
          <button style={mkBtnStyle()} onClick={handleAddSticker} onMouseEnter={e => onEnter(e)} onMouseLeave={e => onLeave(e)} onMouseDown={onDown}><StickyNote size={20} strokeWidth={2} /></button>
          <span style={labelStyle}>Sticker</span>
        </div>

        {/* Group */}
        <div className="flex flex-col items-center justify-center">
          <button style={mkBtnStyle()} onClick={handleAddGroup} onMouseEnter={e => onEnter(e)} onMouseLeave={e => onLeave(e)} onMouseDown={onDown}><Group size={20} strokeWidth={2} /></button>
          <span style={labelStyle}>Group</span>
        </div>

        {/* Tags */}
        <div className="relative flex flex-col items-center justify-center"
          onMouseEnter={() => { if (tagsCloseTimer.current) clearTimeout(tagsCloseTimer.current); setShowTags(true); }}
          onMouseLeave={() => { tagsCloseTimer.current = setTimeout(() => setShowTags(false), 150); }}
        >
          {showTags && renderTagsPanel()}
          <button
            ref={tagsBtnRef}
            style={{ ...mkBtnStyle(hasActiveFilters), top: '-5px' }}
            onClick={() => { setShowTags(true); setShowRooms(false); }}
            onMouseEnter={e => onEnter(e, hasActiveFilters)}
            onMouseLeave={e => onLeave(e, hasActiveFilters)}
            onMouseDown={onDown}
          >
            <Tag size={20} strokeWidth={2} />
            {hasActiveFilters && <span style={{ position: 'absolute', top: 2, right: 2, width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', border: '1.5px solid rgba(10,11,22,0.9)' }} />}
          </button>
          <span style={{ ...labelStyle, color: hasActiveFilters ? 'var(--accent-text)' : 'var(--text-muted)' }}>Tags</span>
        </div>

        {/* Arrange */}
        <div className="flex flex-col items-center justify-center">
          <button style={mkBtnStyle()} onClick={() => { autoArrange(); setTimeout(() => fitView({ duration: 0, padding: 0.5, maxZoom: 1 }), 50); }} onMouseEnter={e => onEnter(e)} onMouseLeave={e => onLeave(e)} onMouseDown={onDown}><Wand2 size={20} strokeWidth={2} /></button>
          <span style={labelStyle}>Arrange</span>
        </div>

        {/* Search */}
        <div className="relative flex flex-col items-center justify-center">
          {showSearch && renderSearchPanel()}
          <button
            ref={searchBtnRef}
            style={{ ...mkBtnStyle(showSearch), top: '-5px' }}
            onClick={() => { setShowSearch(v => !v); setShowRooms(false); setShowTags(false); setShowSettings(false); setSearchQuery(''); }}
            onMouseEnter={e => onEnter(e, showSearch)}
            onMouseLeave={e => onLeave(e, showSearch)}
            onMouseDown={onDown}
          >
            <Search size={20} strokeWidth={2} />
          </button>
          <span style={{ ...labelStyle, color: showSearch ? 'var(--accent-text)' : 'var(--text-muted)' }}>Search</span>
        </div>

        <div className="relative flex flex-col items-center justify-center"
          onMouseEnter={() => { if (settingsCloseTimer.current) clearTimeout(settingsCloseTimer.current); setShowSettings(true); }}
          onMouseLeave={() => { settingsCloseTimer.current = setTimeout(() => setShowSettings(false), 150); }}
        >
          {showSettings && renderSettingsPanel()}
          <button
            ref={settingsBtnRef}
            style={mkBtnStyle(showSettings)}
            onClick={() => { setShowSettings(true); setShowRooms(false); setShowTags(false); }}
            onMouseEnter={e => onEnter(e, showSettings)}
            onMouseLeave={e => onLeave(e, showSettings)}
            onMouseDown={onDown}
          >
            <Settings size={20} strokeWidth={2} />
          </button>
          <span style={{ ...labelStyle, color: showSettings ? 'var(--accent-text)' : 'var(--text-muted)' }}>Settings</span>
        </div>
      </div>
    </div>
    </>
  );
};

export default Toolbar;
