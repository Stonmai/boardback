'use client';

import React from 'react';
import { StickyNote, Plus, Tag, Group, Wand2, Undo2, Redo2, X, Menu, MoreHorizontal, Check, Settings, ExternalLink, LayersPlus, Search, Trash2, CircleEllipsis, Download, Upload, FolderOpen, FolderDown } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { useStore, RoomData, Dossier } from '@/store/useStore';
import { v4 as uuidv4 } from 'uuid';

// ── Emoji helpers ─────────────────────────────────────────────────────────────
const EMOJI_GROUPS = [
  {
    title: "People",
    emojis: [
      '😁','🥴','😋','🥹','😎','🥳','🤗','🤢','🥶','😷',
      '🧐','🤠','🤑','😈','🥰','🥸','🫠','🤭','🙂','😀',
      '😄','😆','😅','😂','🤣','😊','😇','😍','🤩','😘',
      '😗','😚','😙','😌','😏','😴','🤤','😪','😵','🤯',
      '🥺','😡','😱','😭','😬','😮','🤓','🥱','😤','🤥',
      '😶','😐','😑','😯','😦','😧','😲','😢','😰','😥',
      '🫨','🫢','🫣','🤫','🫤','😒','🙄','😠','😳','🤐',
      '👩','🧑','👶','👼','👨','🧔','👵','👴','🧒','👧',
      '👱','🧕','👲','🎅','🤶','🧑‍🎄','🧑‍🍼','🧑‍🎓','🧑‍🏫','🧑‍⚕️',
      '🧑‍🍳','🧑‍🌾','🧑‍🔧','🧑‍🏭','🧑‍💼','🧑‍🔬','🧑‍🎨','🧑‍✈️','🧑‍🚀','🧑‍🚒',
      '👮','💂','🕵️','👷','🫂','🧏','🙆','🙅','💁','🙋',
      '👍','👎','🫰','👏','🙌','🤝','🙏','✌️','👌','👀',
      '🫶','🤞','🖐️','✋','🫡','🤟','🤘','✊','🦾','🦶',
      '👂','🦻','👃','🫀','🫁','🧠','🦷','🦴','👁️','👅',
      '🥷','🦹','🧛','🧙','🧟','🫅','🧝','🧞','🧜','🧚'
    ]
  },
  {
    title: "Places",
    emojis: [
      '🛋️','🍳','🛏️','🚿','🏠','🏡','🏢','🏗️',
      '🏰','🏯','🏛️','🕌','🏕️','🛖','🏘️','🌃',
      '🌆','🌇','🏙️','🏚️','🏬','🏪','🏭','💒',
      '🗼','🗽','🗿','🏟️','🏛','🏞️','🏖️','🏜️',
      '🏔️','⛰️','🌋','🗻','🏝️','🏕️','🌁','🌉',
      '🌌','⛲','🎡','🎢','🎠','🛕','🕍','⛩️','🕋'
    ]
  },
  {
    title: "Productivity",
    emojis: [
      '💼','📝','📌','📎','🔧','⚙️','💡','🔑',
      '📚','📊','📈','📋','🗂️','📦','📬','🗒️',
      '✏️','📐','📏','✂️','🔒','📍','🖊️','📓',
      '🧠','🛠️','🎒','📁','📂','🗃️','🗄️','📅',
      '⏰','⌛','🕒','🕓','🕔','🗓️','📑','📕',
      '📗','📘','📙','👔','🔓','🪝','🪤','📮',
      '📯','🔔','🔕','📣','📢','💬','💭','🗯️',
      '🖋️','🖌️','📤','📥','📧','📨','📩','📫'
    ]
  },
  {
    title: "Entertainment",
    emojis: [
      '🎨','🎬','🎵','🎸','🎹','🎷','🎺','🥁',
      '🎭','🎪','📸','🎤','🎧','📻','🎞️','🎉',
      '🎻','🪕','🪘','📽️','🎟️','🎫','🎰','🎳',
      '🪩','🎯','📺','🎼','🪗','🪈','🥳','🎊',
      '🎋','🎍','🎎','🎏','🎐','🧨','🎆','🎇',
      '🃏','🀄','🎴','🪆','🪅','🎠','🎡','🎢'
    ]
  },
  {
    title: "Shopping",
    emojis: [
      '💄','💋','💅','🧧','💰','💳','🛒','🛍️',
      '👗','👠','👒','🧴','🧼','🪞','💍','⌚',
      '🧢','👟','🧥','🧦','👛','👜','🎒',
      '💵','💴','💶','💷','💸','🏷️','🪙','🤑',
      '👘','👙','🩱','🩲','🩳','🧣','🧤','🧶',
      '👡','👢','🥿','👞','👣','💎','🪬','📿'
    ]
  },
  {
    title: "Travel",
    emojis: [
      '✈️','🚂','🚢','🚗','🏎️','🚲','🛴','🚁',
      '🚤','🛶','🚕','🚓','🚑','🚒','🚜','🚚',
      '🚍','🚉','🚄','🚅','🛫','🛬','🛳️','⛴️',
      '🚀','🛸','🚠','🚡','🚞','🚝','🚋','🚃',
      '🏍️','🛵','🚐','🛻','🚛','🚌','🛺','🚖',
      '⛽','🛞','🚦','🚥','🗺️','🧳','🪂','⛷️'
    ]
  },
  {
    title: "Technology",
    emojis: [
      '💻','📱','🖥️','📷','🔭','🤖','👾',
      '🛸','🚀','🔌','🔋','💾','🖨️','⌨️',
      '🖱️','📡','🧭','🛰️','📀','💿','📼',
      '🧬','🧫','🔬','🧪','💉','🩸',
      '📲','☎️','📞','📟','📠','🔦','🕹️',
      '🎙️','📺','📻','⏱️','⏲️','🧲','💡','🔋',
      '🪫','🖲️','🖼️','🗜️','📸','🔐','🛡️','🔏'
    ]
  },
  {
    title: "Animals",
    emojis: [
      '🐷','🦊','🐱','🐶','🦁','🦋','🐙','🦄',
      '🐸','🦜','🦉','🐺','🐼','🦘','🐉','🦅',
      '🐝','🦩','🐬','🦈','🐘','🦒','🦓','🦔',
      '🐢','🐍','🦎','🦖','🦕','🐓','🐇','🐿️',
      '🐕','🐈','🦦','🦥','🦬','🐂','🐄','🐎',
      '🐖','🐏','🐑','🦙','🐐','🦌','🐕‍🦺','🐩',
      '🦮','🐈‍⬛','🐓','🦃','🦤','🪶','🦚','🦋',
      '🐛','🐌','🐞','🐜','🪲','🪳','🕷️','🦂',
      '🐡','🐠','🐟','🐊','🐸','🐲','🦕','🦖'
    ]
  },
  {
    title: "Nature",
    emojis: [
      '🌿','🌸','🌊','⭐','🌙','☀️','🌈','🌲',
      '🌳','🌴','🌺','🌻','🪷','🌹','🍀','🌱',
      '🌾','❄️','🌧️','⛈️','🌤️','🌬️','🏔️','🌋',
      '🏝️','🪾','🪴','🪨','🌵','🌼','🌞','🌛',
      '🍃','🍂','🍁','🪺','🪸','🌾','🌏','🌍',
      '🌊','🌁','🌫️','🌪️','🌩️','🌨️','☃️','⛄',
      '🌬️','💨','🌀','🌈','☔','⛱️','⚡','🔥'
    ]
  },
  {
    title: "Food & Drink",
    emojis: [
      '☕','🍵','🍕','🍔','🌮','🍣','🍜','🍩',
      '🎂','🍺','🥂','🍷','🍎','🥗','🧁','🥤',
      '🍿','🍪','🍫','🍬','🍭','🥐','🥞','🍞',
      '🧀','🍗','🍖','🍤','🍱','🍛','🍚','🍙',
      '🍉','🍓','🍌','🍇','🍑','🍍','🥭','🍒',
      '🥝','🍅','🥥','🥑','🍆','🥦','🥕','🌽',
      '🌶️','🫑','🧄','🧅','🥔','🍠','🫘','🥜',
      '🫚','🫙','🧂','🥣','🥙','🧆','🥚','🍳',
      '🥘','🍲','🫕','🥫','🫖','🧃','🥛','🍶',
      '🧋','🍹','🍸','🍾','🥃','🫗','🍻','🍵'
    ]
  },
  {
    title: "Activities",
    emojis: [
      '🎯','⛳️','🏆','🥇','🎮','🕹️','🎲','🧩','♟️',
      '🏀','⚽','🏈','🎾','🏋️','🚴','🧘','🤸',
      '🥊','🥋','🏊','🏄','⛹️','🤾','🎳','🏓',
      '🏸','🥏','🎣','🤿','🏹','🛹','🛷','⛸️',
      '🎿','🛼','🪃','🥅','⛷️','🏂','🪁','🤺',
      '🤼','🤽','🚣','🧗','🏇','⛺','🏕️','🎪'
    ]
  },
  {
    title: "Space",
    emojis: [
      '🌌','🌠','🪐','🌍','🌎','🌏','🌕','🌖',
      '🌗','🌘','🌑','🌒','🌓','🌔','☄️','🛰️',
      '🚀','🛸','⭐','✨','🌟','💫','🔭',
      '🌙','🌛','🌜','🌝','🌞','☀️','🌤️','⛅',
      '🪩','🔵','🟣','⚫','🌐','🗺️','🧭','🌀'
    ]
  },
  {
    title: "Health & Body",
    emojis: [
      '🏥','💊','💉','🩺','🩻','🩹','🩼','🩽',
      '🧬','🔬','🧪','🩸','🦷','🦴','👁️','👂',
      '🫀','🫁','🧠','💪','🦵','🦶','🤲','🫶',
      '🧘','🏃','🚶','🛌','🛀','🧖','🧗','🤸',
      '😴','💤','🥱','😪','🥗','🥦','🫐','🥕'
    ]
  },
  {
    title: "Symbols",
    emojis: [
      '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔',
      '❣️','💕','💞','💓','💗','💖','💘','💝','💟','♥️',
      '✅','❌','⭕','🔴','🟠','🟡','🟢','🔵','🟣','⚫',
      '⚪','🟤','🔶','🔷','🔸','🔹','🔺','🔻','💠','🔘',
      '⚡','🔥','💧','🌊','✨','⭐','🌟','💫','☀️','❄️',
      '♻️','✔️','➕','➖','➗','✖️','💯','🔠','🔡','🔢',
      '🅰️','🅱️','🆎','🆑','🆒','🆓','🆔','🆕','🆖','🆗',
      '⬆️','⬇️','⬅️','➡️','↗️','↘️','↙️','↖️','↕️','↔️',
      '🔁','🔂','🔃','🔄','🎵','🎶','🔔','🔕','📳','📴'
    ]
  },
  {
    title: "Objects",
    emojis: [
      '🏮','🪔','💡','🔦','🕯️','🪑','🚪','🪞','🪟','🛋️',
      '🛁','🚿','🪠','🧹','🧺','🧻','🪣','🧴','🧷','🧽',
      '🪤','🧲','🔧','🔨','⚒️','🛠️','⛏️','🔩','🪛','🔗',
      '🧰','🪜','🧱','🔮','🧿','🪬','🗝️','🔐','🔏','🔒',
      '🛡️','⚔️','🗡️','🏹','🪃','🪖','🎀','🎁','🎊','🎉',
      '🎈','🎏','🎐','🎑','🧧','🎗️','🎟️','🎫','🎭','🖼️',
      '🪆','🪅','🧸','🪀','🪁','🎣','🤿','🎽','🥋','🩰',
      '🛍️','🪙','💎','🏅','🥇','🥈','🥉','🏆','🎖️','👑'
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
      '🇨🇭','🇦🇹','🇵🇹','🇬🇷','🇵🇱','🇺🇦','🇮🇱','🇮🇷'
    ]
  },
  {
    title: "Miscellaneous",
    emojis: [
      '💎','👑','🔮','🏅','💯','🏹','🎗️','🌟','✨',
      '🎁','🎀','🧸','🪄','🎃','🎄','🎆','🔨',
      '🏁','⚡','🔥','💥','💤','✅','❌','⭕',
      '♥️','💝','💘','💖','💗','💓','💞',
      '🌀','🎭','🃏','🀄','🎴','🪬','🧿','🔯',
      '☯️','✡️','☪️','✝️','☦️','🛐','⛎','♈',
      '♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'
    ]
  }
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
  // Faces & Emotions
  '😁':'smile happy grin','😋':'yummy tasty food','😎':'cool sunglasses','😍':'love heart eyes',
  '🥰':'love hearts affection','😂':'laugh cry funny','🤣':'rofl laugh funny',
  '😢':'sad cry tear','😭':'sob cry sad','😡':'angry mad rage','😤':'frustrated annoyed',
  '😱':'shocked scared surprise','😴':'sleep tired','🤔':'think hmm question',
  '😇':'angel halo good','🤩':'star eyes excited wow','😈':'devil evil mischief',
  '🥺':'pleading cute sad eyes','😬':'awkward nervous','🫠':'melting hot stress',
  '😮':'surprised wow open mouth','🤯':'mind blown explode','😵':'dizzy confused',
  '🤐':'zip mouth secret quiet','😏':'smirk sly','😒':'unamused boring',
  // Hands & Body
  '👍':'like thumbs up good yes','👎':'dislike thumbs down bad no',
  '👏':'clap applause','🙌':'celebrate hands up','🤝':'handshake deal agree',
  '🙏':'pray thank please','✌️':'peace victory two','👌':'ok perfect','🤞':'fingers crossed luck',
  '🫶':'heart hands love','👀':'eyes look watch','🧠':'brain mind smart think',
  '💪':'strong muscle flex arm','🤜':'fist bump punch','✊':'fist power',
  // People
  '👶':'baby infant child','👧':'girl child kid','👦':'boy child kid',
  '👩':'woman female','👨':'man male','👴':'old man grandpa','👵':'old woman grandma',
  '🧑‍💻':'developer coder programmer tech','🧑‍🎨':'artist designer creative',
  '🧑‍🍳':'chef cook food','🧑‍🏫':'teacher education','🧑‍⚕️':'doctor health medical',
  '🧑‍🔬':'scientist lab research','🧑‍✈️':'pilot flight','🧑‍🚀':'astronaut space',
  '👮':'police officer security','💂':'guard security','🕵️':'detective spy',
  // Places & Buildings
  '🏠':'home house','🏡':'house garden home','🏢':'office building work',
  '🏰':'castle fantasy','🏯':'castle japan','🏗️':'construction build',
  '🏖️':'beach sea vacation','🏔️':'mountain peak snow','🌃':'night city lights',
  '🏙️':'city skyline urban','🌆':'city sunset','🌉':'bridge night',
  '🏕️':'camp tent outdoor','🏝️':'island tropical vacation',
  // Work & Productivity
  '💼':'briefcase work business','📝':'note write memo','📌':'pin location mark',
  '📎':'paperclip attach','🔧':'wrench tool fix','⚙️':'gear settings config',
  '💡':'idea lightbulb thought','🔑':'key lock access','📚':'books study learn',
  '📊':'chart bar graph data','📈':'growth up trend stats','📋':'clipboard list',
  '🗂️':'folder files organize','📦':'box package ship','📬':'mail inbox message',
  '✏️':'pencil write edit','📐':'ruler measure','✂️':'scissors cut',
  '🔒':'lock secure private','🔓':'unlock open access','🪝':'hook link attach',
  '📅':'calendar date schedule','⏰':'alarm clock time','🗓️':'calendar plan',
  '📧':'email mail message','💬':'chat message talk','📢':'announce broadcast',
  '🖊️':'pen write sign','🖋️':'fountain pen write','📓':'notebook journal',
  '📕':'book red','📗':'book green','📘':'book blue','📙':'book orange',
  // Entertainment & Art
  '🎨':'art paint creative design','🎬':'movie film cinema','🎵':'music note song',
  '🎸':'guitar music rock','🎹':'piano keyboard music','🎷':'saxophone jazz music',
  '🎺':'trumpet music','🥁':'drum beat music','🎭':'theater drama act',
  '🎪':'circus show festival','📸':'camera photo picture','🎤':'mic sing vocal',
  '🎧':'headphones music listen','🎞️':'film movie reel','🎉':'party celebrate confetti',
  '🎯':'target aim goal dart','🏆':'trophy win champion award','🥇':'gold medal first win',
  '🎮':'game controller play','🕹️':'joystick arcade game','🎲':'dice random board game',
  '🧩':'puzzle piece jigsaw','🎰':'slot machine casino','🎳':'bowling',
  // Shopping & Fashion
  '💄':'lipstick makeup beauty','💍':'ring jewelry diamond','⌚':'watch time wrist',
  '💰':'money bag rich cash','💳':'card payment credit','🛒':'cart shop buy',
  '👗':'dress fashion clothes','👠':'heel shoe fashion','👟':'sneaker shoe sport',
  '🧴':'lotion bottle skin','🧼':'soap clean wash','💵':'dollar money cash',
  '💸':'money flying spend cash','🏷️':'tag label price','🎒':'backpack school bag',
  '👔':'suit tie formal business','👜':'purse bag fashion',
  // Transport & Travel
  '✈️':'plane flight travel air','🚂':'train rail transport','🚢':'ship cruise ocean',
  '🚗':'car drive road','🏎️':'race car fast sports','🚲':'bike bicycle ride',
  '🚁':'helicopter fly rotor','🚀':'rocket space launch','🛸':'ufo space alien',
  '🚕':'taxi cab ride','🚓':'police car','🚑':'ambulance emergency medical',
  '🚒':'fire truck emergency','🛻':'truck pickup','🧳':'luggage travel bag suitcase',
  '🗺️':'map navigate explore world','🌍':'earth world globe','🌐':'globe world internet',
  // Technology
  '💻':'laptop computer work code','📱':'phone mobile app','🖥️':'desktop monitor screen',
  '📷':'camera photo capture','🔭':'telescope space observe','🤖':'robot ai machine',
  '🔌':'plug power electric','🔋':'battery power charge','💾':'disk save storage',
  '🖨️':'printer print','⌨️':'keyboard type input','🖱️':'mouse click cursor',
  '📡':'satellite signal antenna','💿':'cd disk data','📀':'dvd disk data',
  '🧬':'dna science biology','🔬':'microscope science lab','🧪':'flask lab science test',
  '📲':'phone notification','☎️':'phone call old',
  '🛡️':'shield security protect','🔐':'lock key secure','🔏':'locked pen sign',
  // Animals
  '🐷':'pig animal oink','🦊':'fox animal clever','🐱':'cat animal pet meow',
  '🐶':'dog animal pet woof','🦁':'lion animal king','🦋':'butterfly insect fly',
  '🐙':'octopus ocean sea','🦄':'unicorn fantasy magic','🐸':'frog green hop',
  '🦜':'parrot bird talk color','🦉':'owl wise bird night','🐺':'wolf howl',
  '🐼':'panda bear china','🐉':'dragon fantasy fire','🦅':'eagle bird fly freedom',
  '🐝':'bee honey insect','🐬':'dolphin ocean smart',
  '🦈':'shark ocean danger','🐘':'elephant big animal','🦒':'giraffe tall africa',
  '🐢':'turtle slow shell','🐍':'snake reptile slither','🐕':'dog pet','🐈':'cat pet',
  '🦦':'otter cute water','🐓':'chicken bird','🦃':'turkey bird','🐌':'snail slow',
  '🐞':'ladybug insect red','🐜':'ant insect small','🕷️':'spider web scary',
  // Nature & Weather
  '🌿':'plant green leaf nature','🌸':'flower blossom spring pink','🌊':'wave ocean sea water',
  '⭐':'star shine bright','🌙':'moon night crescent','☀️':'sun shine warm bright day',
  '🌈':'rainbow color sky','🌲':'tree forest pine','🌳':'tree nature park',
  '🌴':'palm tree tropical beach','🌺':'flower tropical color','🌻':'sunflower yellow happy',
  '🪷':'lotus flower zen','🌹':'rose flower love red','🍀':'clover luck green',
  '🌱':'sprout grow plant seed','🌾':'wheat grain harvest','❄️':'snow cold winter ice',
  '🌧️':'rain cloud wet','⛈️':'storm thunder rain','🌤️':'partly cloudy sky',
  '🌬️':'wind blow cold air','🌋':'volcano fire erupt',
  '🪨':'rock stone','🌵':'cactus desert dry','🌼':'flower yellow daisy',
  '🍃':'leaves nature green','🍂':'fall autumn leaves brown','🍁':'maple fall leaf canada',
  '💨':'wind air blow fast','🌀':'cyclone spin swirl','☔':'rain umbrella wet',
  '⚡':'lightning bolt electric fast energy','🔥':'fire hot flame burn',
  // Food & Drink
  '☕':'coffee hot drink morning','🍵':'tea drink hot calm','🍕':'pizza food slice',
  '🍔':'burger food fast','🌮':'taco food mexican','🍣':'sushi japanese food',
  '🍜':'noodle ramen soup','🍩':'donut sweet dessert','🎂':'cake birthday celebrate',
  '🍺':'beer drink alcohol cheers','🥂':'champagne wine celebrate toast',
  '🍷':'wine red drink','🍎':'apple fruit red','🥗':'salad healthy food',
  '🧁':'cupcake sweet dessert','🥤':'drink cup straw juice','🍿':'popcorn movie snack',
  '🍪':'cookie sweet bake','🍫':'chocolate sweet candy','🍬':'candy sweet sugar',
  '🍭':'lollipop candy sweet','🥐':'croissant bread breakfast french','🥞':'pancake breakfast',
  '🍞':'bread bake food','🧀':'cheese food dairy','🍗':'chicken meat food',
  '🍖':'meat food rib bbq','🍱':'bento box japanese food','🍛':'curry food spice',
  '🍇':'grapes fruit purple','🍉':'watermelon fruit summer','🍓':'strawberry fruit red',
  '🍌':'banana fruit yellow','🍑':'peach fruit','🍍':'pineapple tropical fruit',
  '🥑':'avocado green healthy','🍅':'tomato red vegetable','🥦':'broccoli green vegetable',
  '🌽':'corn yellow vegetable','🌶️':'pepper spicy hot red','🧄':'garlic vegetable',
  '🥕':'carrot orange vegetable','🍠':'sweet potato food','🥜':'peanut nut snack',
  '🍹':'cocktail tropical drink','🍸':'martini drink cocktail','🍾':'champagne celebrate wine',
  '🥃':'whiskey drink alcohol','🧋':'bubble tea drink boba','🍶':'sake japanese drink',
  '🫖':'teapot tea brew',
  // Activities & Sports
  '⛳':'golf sport',
  '🏀':'basketball sport ball','⚽':'soccer football sport','🏈':'american football sport',
  '🎾':'tennis sport ball','🏋️':'weightlifting gym strong','🚴':'cycling bike sport',
  '🧘':'yoga meditate calm','🤸':'gymnastics flexible sport','🥊':'boxing fight glove',
  '🏊':'swim water sport','🏄':'surf wave sport ocean',
  '🏓':'pingpong table tennis','🏸':'badminton sport','🎣':'fish fishing hobby',
  '🤿':'diving scuba underwater','🏹':'archery arrow bow','🛹':'skateboard skate',
  '⛷️':'ski snow winter sport','🏂':'snowboard winter sport',
};

const searchEmoji = (q: string, emoji: string, groupTitle: string): boolean => {
  if (!q) return true;
  const lower = q.toLowerCase();
  if (groupTitle.toLowerCase().includes(lower)) return true;
  if (emoji.includes(q)) return true;
  const kw = EMOJI_KEYWORDS[emoji];
  return kw ? kw.toLowerCase().includes(lower) : false;
};

// ── Panel base style ──────────────────────────────────────────────────────────
const panelStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 'calc(100% + 18px)',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(10, 11, 22, 0.94)',
  backdropFilter: 'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 20,
  padding: 14,
  boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
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
          style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '6px 10px', color: '#fff', fontSize: 12, outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
        />
        <div style={{ maxHeight: isInline ? 180 : 230, paddingRight: 4, overflowY: "auto", overflowX: 'hidden' }}>
          {filteredGroups.length === 0 ? (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '16px 0' }}>No results</div>
          ) : filteredGroups.map(group => (
            <div key={group.title} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5, paddingLeft: 2 }}>
                {group.title}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 2 }}>
                {group.emojis.map((emoji, emojiIdx) => {
                  const active = emoji === currentEmoji;
                  return (
                    <button
                      key={`${group.title}-${emojiIdx}`}
                      onClick={() => onSelect(emoji)}
                      style={{ width: 30, height: 30, borderRadius: 7, background: active ? "rgba(200,241,53,0.12)" : "transparent", border: active ? "1px solid rgba(200,241,53,0.3)" : "none", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.1s" }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
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
  const setPendingNavigation = useStore((s) => s.setPendingNavigation);
  const dossiers = useStore((s) => s.dossiers);
  const currentDossierId = useStore((s) => s.currentDossierId);
  const switchDossier = useStore((s) => s.switchDossier);
  const addDossier = useStore((s) => s.addDossier);
  const deleteDossier = useStore((s) => s.deleteDossier);
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
  React.useEffect(() => { setEmojiSearch(''); }, [emojiPickerFor]);
  // ID of room being renamed (inline edit panel)
  const [renamingRoomId, setRenamingRoomId] = React.useState<string | null>(null);
  const [renameValue, setRenameValue] = React.useState('');
  const [hoveredRoomId, setHoveredRoomId] = React.useState<string | null>(null);
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
      ghost.style.cssText = 'position:fixed;top:-1000px;left:-1000px;display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 14px;background:rgba(10,11,22,0.92);border:1px solid rgba(255,255,255,0.14);border-radius:14px;pointer-events:none;';
      const emoji = document.createElement('div');
      emoji.style.cssText = 'font-size:22px;line-height:1;';
      emoji.textContent = getRoomEmoji(room);
      const name = document.createElement('div');
      name.style.cssText = 'font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.6);white-space:nowrap;';
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
    fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.28)',
    textTransform: 'uppercase', letterSpacing: '0.08em', userSelect: 'none', lineHeight: 1,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
  };

  const mkBtnStyle = (active = false): React.CSSProperties => ({
    width: isMobile ? 34 : 44, height: isMobile ? 32 : 36, borderRadius: 13,
    background: active ? 'rgba(200,241,53,0.12)' : 'transparent', border: 'none',
    color: active ? '#c8f135' : 'rgba(255,255,255,0.5)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.18s ease', position: 'relative', top: isMobile ? 0 : '-5px',
  });

  const onEnter = (e: React.MouseEvent<HTMLButtonElement>, skip = false) => {
    if (skip) return;
    const el = e.currentTarget as HTMLButtonElement;
    el.style.background = 'rgba(255,255,255,0.07)';
    el.style.color = '#ffffff';
    el.style.transform = 'translateY(-2px)';
  };
  const onLeave = (e: React.MouseEvent<HTMLButtonElement>, skip = false) => {
    if (skip) return;
    const el = e.currentTarget as HTMLButtonElement;
    el.style.background = 'transparent';
    el.style.color = 'rgba(255,255,255,0.5)';
    el.style.transform = 'translateY(0)';
  };
  const onDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0) scale(0.92)';
  };

  // ── Add workspace panel (shared) ──────────────────────────────────────────
  const renderAddWsPanel = () => (
    <div ref={addWsRef} style={{ ...panelStyle, minWidth: 230 }}>
      <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
        New board
      </div>
      {/* Emoji selector */}
      <div style={{ marginBottom: 10 }}>
        <button
          onClick={() => setEmojiPickerFor(emojiPickerFor === 'new' ? null : 'new')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 12, background: emojiPickerFor === 'new' ? 'rgba(200,241,53,0.10)' : 'rgba(255,255,255,0.06)', border: emojiPickerFor === 'new' ? '1px solid rgba(200,241,53,0.3)' : '1px solid rgba(255,255,255,0.09)', cursor: 'pointer', transition: 'all 0.15s' }}
        >
          <span style={{ fontSize: 22, lineHeight: 1 }}>{newWsEmoji}</span>
        </button>
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
          style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 10px', color: '#ffffff', fontSize: 12, outline: 'none' }}
        />
        <button
          onClick={handleAddWorkspace}
          disabled={!newWsName.trim()}
          style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 10, background: newWsName.trim() ? 'rgba(200,241,53,0.15)' : 'rgba(255,255,255,0.04)', border: newWsName.trim() ? '1px solid rgba(200,241,53,0.35)' : '1px solid rgba(255,255,255,0.08)', color: newWsName.trim() ? '#c8f135' : 'rgba(255,255,255,0.3)', cursor: newWsName.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
        >
          <Check size={15} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );

  // ── Shared rooms panel (mobile/compact) ───────────────────────────────────
  const renderRoomsPanel = (width: number) => (
    <div ref={roomsRef} style={{ ...panelStyle, width: Math.min(width, window.innerWidth - 32) }}>
      <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, paddingLeft: 2 }}>
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
                  style={{ width: '100%', borderRadius: 14, padding: '12px 8px', background: active ? 'rgba(200,241,53,0.12)' : 'rgba(255,255,255,0.04)', border: active ? '1px solid rgba(200,241,53,0.35)' : '1px solid rgba(255,255,255,0.07)', color: active ? '#c8f135' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, transition: 'all 0.15s' }}>
                  <span style={{ fontSize: 22 }}>{getRoomEmoji(room)}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1, maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.name}</span>
                </button>
                {!active && rooms.length > 1 && (
                  <button onClick={e => { e.stopPropagation(); setDeleteConfirm({ id: room.id, name: room.name }); }} title="Delete board"
                    style={{ position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,60,60,0.75)', border: '1.5px solid rgba(10,11,22,0.85)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, lineHeight: 1 }}>
                    ×
                  </button>
                )}
              </div>
            );
          })}
          {/* Add workspace */}
          <button onClick={() => setShowAddWs(true)}
            style={{ borderRadius: 14, padding: '12px 8px', background: 'rgba(255,255,255,0.03)', border: '1.5px dashed rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, transition: 'all 0.15s' }}>
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
              style={{ fontSize: 22, lineHeight: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, padding: '6px 8px', cursor: 'pointer' }}
            >
              {newWsEmoji}
            </button>
            <input
              ref={wsInputRef}
              value={newWsName}
              onChange={e => setNewWsName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddWorkspace(); if (e.key === 'Escape') { setShowAddWs(false); setEmojiPickerFor(null); } }}
              placeholder="Board name..."
              autoFocus
              style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 10px', color: '#ffffff', fontSize: 12, outline: 'none' }}
            />
          </div>
          {emojiPickerFor === 'new' && renderEmojiPicker(
            (emoji) => { setNewWsEmoji(emoji); setEmojiPickerFor(null); },
            newWsEmoji,
            true
          )}
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleAddWorkspace} disabled={!newWsName.trim()}
              style={{ flex: 1, padding: '8px 0', borderRadius: 10, background: newWsName.trim() ? 'rgba(200,241,53,0.15)' : 'rgba(255,255,255,0.04)', border: newWsName.trim() ? '1px solid rgba(200,241,53,0.35)' : '1px solid rgba(255,255,255,0.08)', color: newWsName.trim() ? '#c8f135' : 'rgba(255,255,255,0.3)', cursor: newWsName.trim() ? 'pointer' : 'default', fontSize: 11, fontWeight: 700 }}>
              Add
            </button>
            <button onClick={() => { setShowAddWs(false); setEmojiPickerFor(null); }}
              style={{ flex: 1, padding: '8px 0', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
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
        <span style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Filter by tag</span>
        {hasActiveFilters && (
          <button onClick={() => { [...activeTagFilters].forEach(t => toggleTagFilter(t)); }} style={{ fontSize: 9, fontWeight: 700, color: 'rgba(200,241,53,0.7)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
            <X size={10} /> Clear
          </button>
        )}
      </div>
      {allTags.length === 0 ? (
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '8px 0', margin: 0 }}>No tags yet</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {allTags.map(tag => {
            const active = activeTagFilters.includes(tag);
            return (
              <button key={tag} onClick={() => toggleTagFilter(tag)} style={{ padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: active ? 'rgba(200,241,53,0.15)' : 'rgba(255,255,255,0.06)', border: active ? '1px solid rgba(200,241,53,0.4)' : '1px solid rgba(255,255,255,0.08)', color: active ? '#c8f135' : 'rgba(255,255,255,0.55)', cursor: 'pointer', transition: 'all 0.15s', textTransform: 'uppercase' }}>
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
      <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Settings</div>

      {/* Dossier menu row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '10px 12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', marginBottom: 8 }}
        onClick={() => { setShowDossierModal(true); setShowSettings(false); }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FolderOpen size={16} color="rgba(255,255,255,0.3)" />
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 1 }}>Dossier</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
              {(() => { const d = dossiers.find((d: Dossier) => d.id === currentDossierId); return d ? `${d.name}` : 'Manage dossiers'; })()}
            </div>
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </div>

      {/* Share row — opens export modal */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '10px 12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', marginBottom: 8 }}
        onClick={() => { const d = dossiers.find((d: Dossier) => d.id === currentDossierId); setExportNameValue(d?.name || 'Default'); setShowExportModal(true); }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Download size={16} color="rgba(255,255,255,0.3)" />
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 1 }}>Export</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Download dossier as .boardback file</div>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 8 }} />
      
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.05)',
          padding: '10px 12px',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.08)',
          cursor: 'pointer'
        }}
        onClick={() => setAutoOpenBookmarks(!autoOpenBookmarks)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ExternalLink size={16} color={autoOpenBookmarks ? '#c8f135' : 'rgba(255,255,255,0.3)'} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 1 }}>Open bookmark in new tab</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Click a preview to open it in a new browser tab</div>
          </div>
        </div>
        <div 
          style={{ 
            width: 40, 
            height: 18, 
            borderRadius: 20, 
            background: autoOpenBookmarks ? 'rgba(200,241,53,0.3)' : 'rgba(255,255,255,0.1)',
            border: autoOpenBookmarks ? '1px solid rgba(200,241,53,0.5)' : '1px solid rgba(255,255,255,0.15)',
            position: 'relative',
            transition: 'all 0.2s',
            flexShrink: 0
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 2,
              left: autoOpenBookmarks ? 24 : 2,
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: autoOpenBookmarks ? '#c8f135' : 'rgba(255,255,255,0.4)',
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
          background: 'rgba(255,255,255,0.05)',
          padding: '10px 12px',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.08)',
          cursor: extensionInstalled ? 'pointer' : 'default',
          marginTop: 8,
          opacity: extensionInstalled ? 1 : 0.45,
        }}
        onClick={extensionInstalled ? handleNewTabToggle : undefined}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={newTabEnabled ? '#c8f135' : 'rgba(255,255,255,0.3)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 1 }}>Open BoardBack on new tab</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
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
            background: newTabEnabled ? 'rgba(200,241,53,0.3)' : 'rgba(255,255,255,0.1)',
            border: newTabEnabled ? '1px solid rgba(200,241,53,0.5)' : '1px solid rgba(255,255,255,0.15)',
            position: 'relative',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 2,
              left: newTabEnabled ? 24 : 2,
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: newTabEnabled ? '#c8f135' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.2s'
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderSearchPanel = () => (
    <div ref={searchRef} style={{ ...panelStyle, width: Math.min(320, window.innerWidth - 32) }}>
      <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Search</div>
      <input
        ref={searchInputRef}
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        onKeyDown={e => { if (e.key === 'Escape') { setShowSearch(false); setSearchQuery(''); } }}
        placeholder="Search bookmarks, notes, groups..."
        autoFocus
        style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 10px', color: '#ffffff', fontSize: 12, outline: 'none', boxSizing: 'border-box', marginBottom: searchQuery.trim() ? 8 : 0 }}
      />
      {searchQuery.trim() && (
        <div style={{ maxHeight: 280, overflowY: 'auto' }}>
          {searchResults.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12, padding: '16px 0' }}>No results found</div>
          ) : (
            searchResults.map(result => (
              <button key={`${result.id}-${result.roomId}`} onClick={() => handleSearchResultClick(result)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid transparent', cursor: 'pointer', textAlign: 'left', marginBottom: 4, transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'; }}
              >
                <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: result.type === 'bookmark' ? 'rgba(59,130,246,0.15)' : result.type === 'note' ? 'rgba(168,85,247,0.15)' : 'rgba(34,197,94,0.15)' }}>
                  {result.type === 'bookmark' ? <ExternalLink size={13} color="#3b82f6" /> : result.type === 'note' ? <StickyNote size={13} color="#a855f7" /> : <Group size={13} color="#22c55e" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{result.title || 'Untitled'}</div>
                  {result.subtitle && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>{result.subtitle}</div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: result.type === 'bookmark' ? 'rgba(59,130,246,0.7)' : result.type === 'note' ? 'rgba(168,85,247,0.7)' : 'rgba(34,197,94,0.7)' }}>{result.type}</span>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>{result.roomEmoji} {result.roomName}</span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );

  // ── Delete confirmation modal ─────────────────────────────────────────────
  const deleteModal = deleteConfirm && (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(9,10,20,0.75)', backdropFilter: 'blur(12px)' }}
      onClick={() => setDeleteConfirm(null)}>
      <div style={{ background: '#11121d', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: '24px', width: 300, boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,60,60,0.12)', border: '1px solid rgba(255,60,60,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,100,100,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </div>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Delete board?</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 20, lineHeight: 1.5 }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>"{deleteConfirm.name}"</span> and all its content will be permanently removed.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setDeleteConfirm(null)}
            style={{ flex: 1, padding: '9px 0', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
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
      <div style={{ background: '#11121d', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 24, padding: '28px', width: 720, maxWidth: 'calc(100vw - 32px)', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}
        onClick={e => { e.stopPropagation(); setFocusedDossierId(null); setDossierMenuId(null); setRenamingDossierId(null); setRenameDossierValue(''); if (showAddDossier) { if (newDossierName.trim()) addDossier(newDossierName.trim(), '📁'); setShowAddDossier(false); setNewDossierName(''); } }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Dossiers</div>
          <button onClick={() => { setShowDossierModal(false); setShowAddDossier(false); setNewDossierName(''); setEmojiPickerFor(null); setFocusedDossierId(null); setDossierMenuId(null); setRenamingDossierId(null); setRenameDossierValue(''); }}
            style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={14} />
          </button>
        </div>

        {/* File grid */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${isCompact ? 2 : isMobile ? 3 : 5}, 1fr)`, gap: 16, marginBottom: 35 }} onClick={() => { setDossierMenuId(null); setFocusedDossierId(null); setRenamingDossierId(null); setRenameDossierValue(''); }}>
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
                  <div onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, height: 108, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.28)', padding: '0 8px', boxSizing: 'border-box', overflow: 'hidden' }}>
                    <span style={{ fontSize: 40, lineHeight: 1, flexShrink: 0 }}>✏️</span>
                    <input
                      value={renameDossierValue}
                      onChange={e => setRenameDossierValue(e.target.value)}
                      autoFocus
                      onKeyDown={e => { if (e.key === 'Enter' && renameDossierValue.trim()) { updateDossierName(renamingDossierId, renameDossierValue.trim()); setRenamingDossierId(null); setRenameDossierValue(''); } if (e.key === 'Escape') { setRenamingDossierId(null); setRenameDossierValue(''); } }}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 7, padding: '4px 7px', color: '#fff', fontSize: 11, fontWeight: 600, outline: 'none', boxSizing: 'border-box', textAlign: 'center' }}
                    />
                  </div>
                ) : (
                  <div
                    onClick={e => { e.stopPropagation(); if (!isActive) setFocusedDossierId(d.id); }}
                    onDoubleClick={e => { e.stopPropagation(); if (!isActive) { switchDossier(d.id); setShowDossierModal(false); setFocusedDossierId(null); } }}
                    onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setDossierMenuId(menuOpen ? null : d.id); }}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, height: 108, borderRadius: 16,
                      background: isActive ? 'rgba(200,241,53,0.10)' : isFocused ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isActive ? 'rgba(200,241,53,0.35)' : isFocused ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.07)'}`,
                      boxShadow: isFocused ? '0 0 0 3px rgba(255,255,255,0.06)' : 'none',
                      cursor: isActive ? 'default' : 'pointer', transition: 'all 0.15s', padding: '0 10px', boxSizing: 'border-box', overflow: 'hidden', userSelect: 'none',
                    }}
                    onMouseEnter={e => { if (!isActive && !isFocused) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.07)'; }}
                    onMouseLeave={e => { if (!isActive && !isFocused) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; }}>
                    <span style={{ fontSize: 40, lineHeight: 1, flexShrink: 0 }}>{isActive || isFocused ? '📂' : '📁'}</span>
                    <div style={{ fontSize: 12, fontWeight: 600, color: isActive ? '#c8f135' : isFocused ? '#fff' : 'rgba(255,255,255,0.75)', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>{d.name}</div>
                  </div>
                )}

                {/* ⋯ menu button + dropdown wrapper */}
                <div style={{ position: 'absolute', top: 6, right: 6 }}>
                  <button className="menu-btn"
                    onClick={e => { e.stopPropagation(); setDossierMenuId(menuOpen ? null : d.id); }}
                    style={{ width: 22, height: 22, borderRadius: 6, background: menuOpen ? 'rgba(255,255,255,0.12)' : 'rgba(20,20,30,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, opacity: menuOpen ? 1 : 0, transition: 'opacity 0.15s' }}>
                    <MoreHorizontal size={12} />
                  </button>
                  {menuOpen && (
                    <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: 26, ...(isLastCol ? { right: 0 } : { left: 0 }), zIndex: 10, background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', overflow: 'hidden', minWidth: 120 }}>
                      {[
                        { label: 'Open', icon: <FolderOpen size={12} />, action: () => { if (!isActive) { switchDossier(d.id); } setShowDossierModal(false); setDossierMenuId(null); }, disabled: false },
                        { label: 'Rename', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>, action: () => { setRenamingDossierId(d.id); setRenameDossierValue(d.name); setDossierMenuId(null); } },
                        { label: 'Export', icon: <Download size={12} />, action: () => { const activeDossier = dossiers.find((dd: Dossier) => dd.id === currentDossierId); setExportNameValue(activeDossier?.name || 'Default'); setShowExportModal(true); setDossierMenuId(null); } },
                        { label: 'Delete', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>, action: () => { setDeleteDossierConfirm({ id: d.id, name: d.name }); setDossierMenuId(null); }, danger: true, disabled: dossiers.length <= 1 },
                      ].map(item => (
                        <button key={item.label} onClick={item.action} disabled={item.disabled}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'transparent', border: 'none', color: item.danger ? '#ff6b6b' : 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 500, cursor: item.disabled ? 'default' : 'pointer', opacity: item.disabled ? 0.3 : 1, textAlign: 'left' }}
                          onMouseEnter={e => { if (!item.disabled) (e.currentTarget as HTMLButtonElement).style.background = item.danger ? 'rgba(255,60,60,0.1)' : 'rgba(255,255,255,0.06)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
                          {item.icon}{item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {/* New dossier inline card */}
          {showAddDossier && (
            <div onClick={e => e.stopPropagation()} style={{ position: 'relative', minWidth: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, height: 108, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.28)', padding: '0 8px', boxSizing: 'border-box', overflow: 'hidden' }}>
                <span style={{ fontSize: 40, lineHeight: 1, flexShrink: 0 }}>📁</span>
                <input
                  value={newDossierName}
                  onChange={e => setNewDossierName(e.target.value)}
                  autoFocus
                  onFocus={e => e.target.select()}
                  onKeyDown={e => { if (e.key === 'Enter') { if (newDossierName.trim()) addDossier(newDossierName.trim(), '📁'); setShowAddDossier(false); setNewDossierName(''); } if (e.key === 'Escape') { setShowAddDossier(false); setNewDossierName(''); } }}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 7, padding: '4px 7px', color: '#fff', fontSize: 11, fontWeight: 600, outline: 'none', boxSizing: 'border-box', textAlign: 'center' }}
                />
              </div>
            </div>
          )}
        </div>

        <input ref={importDossierRef} type="file" accept=".boardback" style={{ display: 'none' }} onChange={handleDossierImport} />

        {/* New and Import buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={e => { e.stopPropagation(); setShowAddDossier(true); setNewDossierName('New Dossier'); }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 0', borderRadius: 12, background: 'transparent', border: '1px dashed rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.65)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)'; }}>
            <Plus size={14} strokeWidth={2} /> New Dossier
          </button>
          <button onClick={e => { e.stopPropagation(); importDossierRef.current?.click(); }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 0', borderRadius: 12, background: 'transparent', border: '1px dashed rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.65)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)'; }}>
            <FolderDown size={14} strokeWidth={2} /> Import .boardback
          </button>
        </div>

      </div>
    </div>
  );

  const deleteDossierModal = deleteDossierConfirm && (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(9,10,20,0.75)', backdropFilter: 'blur(12px)' }}
      onClick={() => setDeleteDossierConfirm(null)}>
      <div style={{ background: '#11121d', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: '24px', width: 300, boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,60,60,0.12)', border: '1px solid rgba(255,60,60,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <FolderOpen size={18} color="rgba(255,100,100,0.9)" />
        </div>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Delete Dossier?</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 20, lineHeight: 1.5 }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>"{deleteDossierConfirm.name}"</span> and all its boards will be permanently removed.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setDeleteDossierConfirm(null)}
            style={{ flex: 1, padding: '9px 0', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
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
      <div style={{ background: '#11121d', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: 28, width: 360, maxWidth: 'calc(100vw - 32px)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Export Dossier</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 20, lineHeight: 1.6 }}>
          Set a name for the exported dossier. The file will be downloaded as a <span style={{ color: 'rgba(200,241,53,0.8)', fontWeight: 600 }}>.boardback</span> file.
        </div>
        <input
          value={exportNameValue}
          onChange={e => setExportNameValue(e.target.value)}
          placeholder="Dossier name…"
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter' && exportNameValue.trim()) { exportDossier(exportNameValue.trim()); setShowExportModal(false); } if (e.key === 'Escape') setShowExportModal(false); }}
          style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '9px 12px', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowExportModal(false)}
            style={{ flex: 1, padding: '9px 0', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
          <button disabled={!exportNameValue.trim()} onClick={() => { if (exportNameValue.trim()) { exportDossier(exportNameValue.trim()); setShowExportModal(false); } }}
            style={{ flex: 1, padding: '9px 0', borderRadius: 10, background: exportNameValue.trim() ? 'rgba(200,241,53,0.15)' : 'rgba(255,255,255,0.04)', border: exportNameValue.trim() ? '1px solid rgba(200,241,53,0.35)' : '1px solid rgba(255,255,255,0.08)', color: exportNameValue.trim() ? '#c8f135' : 'rgba(255,255,255,0.25)', fontSize: 12, fontWeight: 700, cursor: exportNameValue.trim() ? 'pointer' : 'default' }}>Export</button>
        </div>
      </div>
    </div>
  );

  const importModal = pendingImportDossier && (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(9,10,20,0.80)', backdropFilter: 'blur(12px)' }}
      onClick={() => setPendingImportDossier(null)}>
      <div style={{ background: '#11121d', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: 28, width: 360, maxWidth: 'calc(100vw - 32px)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Import Dossier</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 20, lineHeight: 1.6 }}>
          Set a name for the imported dossier.
        </div>
        <input
          value={pendingImportName}
          onChange={e => setPendingImportName(e.target.value)}
          placeholder="Dossier name…"
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter' && pendingImportName.trim()) { commitImportDossier(pendingImportDossier, pendingImportName.trim()); setPendingImportDossier(null); } if (e.key === 'Escape') setPendingImportDossier(null); }}
          style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '9px 12px', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setPendingImportDossier(null)}
            style={{ flex: 1, padding: '9px 0', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
          <button disabled={!pendingImportName.trim()} onClick={() => { if (pendingImportName.trim()) { commitImportDossier(pendingImportDossier!, pendingImportName.trim()); setPendingImportDossier(null); } }}
            style={{ flex: 1, padding: '9px 0', borderRadius: 10, background: pendingImportName.trim() ? 'rgba(200,241,53,0.15)' : 'rgba(255,255,255,0.04)', border: pendingImportName.trim() ? '1px solid rgba(200,241,53,0.35)' : '1px solid rgba(255,255,255,0.08)', color: pendingImportName.trim() ? '#c8f135' : 'rgba(255,255,255,0.25)', fontSize: 12, fontWeight: 700, cursor: pendingImportName.trim() ? 'pointer' : 'default' }}>Import</button>
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
                    style={{ borderRadius: 14, padding: '10px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: item.active ? 'rgba(200,241,53,0.12)' : 'rgba(255,255,255,0.05)', border: item.active ? '1px solid rgba(200,241,53,0.35)' : '1px solid rgba(255,255,255,0.07)', color: item.active ? '#c8f135' : 'rgba(255,255,255,0.65)', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {item.icon}
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 10px', background: 'rgba(10, 11, 22, 0.72)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 40, boxShadow: '0 24px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)', height: 60, animation: 'pillFloat 5s ease-in-out infinite' }}>
            <button ref={roomsBtnRef} onClick={() => { setShowRooms(v => !v); setShowMenu(false); setShowTags(false); setShowAddWs(false); setEmojiPickerFor(null); setShowSettings(false); }}
              style={{ width: 34, height: 34, borderRadius: 12, background: showRooms ? 'rgba(200,241,53,0.12)' : 'transparent', border: 'none', color: showRooms ? '#c8f135' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s', fontSize: 20 }}>
              {currentRoom ? getRoomEmoji(currentRoom) : '📌'}
            </button>
            <button onClick={undo} disabled={!canUndo}
              style={{ width: 30, height: 30, borderRadius: 10, background: 'transparent', border: 'none', color: canUndo ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.18)', cursor: canUndo ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Undo2 size={16} strokeWidth={2} />
            </button>
            <button onClick={redo} disabled={!canRedo}
              style={{ width: 30, height: 30, borderRadius: 10, background: 'transparent', border: 'none', color: canRedo ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.18)', cursor: canRedo ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Redo2 size={16} strokeWidth={2} />
            </button>
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
            <button onClick={handleAddBookmark}
              style={{ width: 40, height: 40, borderRadius: 14, background: '#c8f135', color: '#0a0b16', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(200,241,53,0.5)', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
              <Plus size={20} strokeWidth={2.5} />
            </button>
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
            <button onClick={() => { setShowMenu(v => !v); setShowRooms(false); setShowTags(false); setShowSettings(false); setShowSearch(false); setSearchQuery(''); }} onMouseDown={e => e.stopPropagation()}
              style={{ width: 34, height: 34, borderRadius: 12, background: showMenu ? 'rgba(200,241,53,0.12)' : 'transparent', border: 'none', color: showMenu ? '#c8f135' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Menu size={18} strokeWidth={2} />
              {hasActiveFilters && <span style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: '50%', background: '#c8f135', border: '1.5px solid rgba(10,11,22,0.9)' }} />}
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
                    style={{ borderRadius: 14, padding: '10px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: item.active ? 'rgba(200,241,53,0.12)' : 'rgba(255,255,255,0.05)', border: item.active ? '1px solid rgba(200,241,53,0.35)' : '1px solid rgba(255,255,255,0.07)', color: item.active ? '#c8f135' : 'rgba(255,255,255,0.65)', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {item.icon}
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', background: 'rgba(10, 11, 22, 0.72)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 40, boxShadow: '0 24px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)', height: 60, animation: 'pillFloat 5s ease-in-out infinite' }}>
            <button ref={roomsBtnRef} onClick={() => { setShowRooms(v => !v); setShowMenu(false); setShowTags(false); setShowAddWs(false); setEmojiPickerFor(null); setShowSettings(false); }}
              style={{ width: 36, height: 36, borderRadius: 13, background: showRooms ? 'rgba(200,241,53,0.12)' : 'transparent', border: 'none', color: showRooms ? '#c8f135' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              {currentRoom ? getRoomEmoji(currentRoom) : '📌'}
            </button>
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
            <button onClick={undo} disabled={!canUndo}
              style={{ width: 34, height: 34, borderRadius: 11, background: 'transparent', border: 'none', color: canUndo ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.18)', cursor: canUndo ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Undo2 size={18} strokeWidth={2} />
            </button>
            <button onClick={redo} disabled={!canRedo}
              style={{ width: 34, height: 34, borderRadius: 11, background: 'transparent', border: 'none', color: canRedo ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.18)', cursor: canRedo ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Redo2 size={18} strokeWidth={2} />
            </button>
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
            <button onClick={handleAddBookmark}
              style={{ width: 44, height: 44, borderRadius: 16, background: '#c8f135', color: '#0a0b16', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(200,241,53,0.5)', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
              <Plus size={22} strokeWidth={2.5} />
            </button>
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
            <button onClick={() => { setShowMenu(v => !v); setShowRooms(false); setShowTags(false); setShowSettings(false); setShowSearch(false); setSearchQuery(''); }} onMouseDown={e => e.stopPropagation()}
              style={{ width: 38, height: 38, borderRadius: 13, background: showMenu ? 'rgba(200,241,53,0.12)' : 'transparent', border: 'none', color: showMenu ? '#c8f135' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Menu size={20} strokeWidth={2} />
              {hasActiveFilters && <span style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: '50%', background: '#c8f135', border: '1.5px solid rgba(10,11,22,0.9)' }} />}
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
    {deleteModal}
    {deleteDossierModal}
    {dossierModal}
    {exportModal}
    {importModal}
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-100" style={{ maxWidth: 'calc(100vw - 2rem)', userSelect: 'none' }}>
      <div className="flex items-center"
        style={{ gap: 8, padding: '0 16px', animation: 'pillFloat 5s ease-in-out infinite', background: 'rgba(10, 11, 22, 0.72)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '40px', boxShadow: '0 24px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)', height: 76 }}>

        {/* ── Boards ─────────────────────────────────────────────────── */}
        {maxInlineRooms === 0 ? (
          /* 540–640px: single dropdown */
          <div className="relative" ref={roomsRef}>
            {showRooms && (
              <div style={{ ...panelStyle, width: Math.min(230, window.innerWidth - 32) }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, paddingLeft: 2 }}>Boards</div>
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
                          style={{ width: '100%', borderRadius: 14, padding: '12px 8px', background: active ? 'rgba(200,241,53,0.12)' : 'rgba(255,255,255,0.04)', border: active ? '1px solid rgba(200,241,53,0.35)' : '1px solid rgba(255,255,255,0.07)', color: active ? '#c8f135' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, transition: 'all 0.15s' }}>
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
                    style={{ width: '100%', padding: '9px 0', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1.5px dashed rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11, fontWeight: 700, transition: 'all 0.15s' }}>
                    <LayersPlus size={14} strokeWidth={2} /> New
                  </button>
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <button onClick={() => setEmojiPickerFor(emojiPickerFor === 'new' ? null : 'new')}
                        style={{ fontSize: 22, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, padding: '5px 7px', cursor: 'pointer', lineHeight: 1 }}>
                        {newWsEmoji}
                      </button>
                      <input ref={wsInputRef} value={newWsName} onChange={e => setNewWsName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleAddWorkspace(); if (e.key === 'Escape') { setShowAddWs(false); setEmojiPickerFor(null); } }}
                        placeholder="Board name..."
                        autoFocus
                        style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '7px 9px', color: '#ffffff', fontSize: 12, outline: 'none' }}
                      />
                    </div>
                    {emojiPickerFor === 'new' && renderEmojiPicker(
                      (emoji) => { setNewWsEmoji(emoji); setEmojiPickerFor(null); },
                      newWsEmoji,
                      true
                    )}
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={handleAddWorkspace} disabled={!newWsName.trim()}
                        style={{ flex: 1, padding: '7px 0', borderRadius: 9, background: newWsName.trim() ? 'rgba(200,241,53,0.15)' : 'rgba(255,255,255,0.04)', border: newWsName.trim() ? '1px solid rgba(200,241,53,0.35)' : '1px solid rgba(255,255,255,0.08)', color: newWsName.trim() ? '#c8f135' : 'rgba(255,255,255,0.3)', cursor: newWsName.trim() ? 'pointer' : 'default', fontSize: 11, fontWeight: 700 }}>Add</button>
                      <button onClick={() => { setShowAddWs(false); setEmojiPickerFor(null); }}
                        style={{ flex: 1, padding: '7px 0', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex flex-col items-center justify-center" style={{ margin: '0 12px' }}>
              <button ref={roomsBtnRef} onClick={() => setShowRooms(v => !v)}
                style={{ width: 44, height: 36, borderRadius: 13, background: showRooms ? 'rgba(200,241,53,0.12)' : 'transparent', border: 'none', color: showRooms ? '#c8f135' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, position: 'relative', top: '-5px' }}>
                {currentRoom ? getRoomEmoji(currentRoom) : '📌'}
              </button>
              <span style={{ fontSize: 9, fontWeight: 700, color: showRooms ? 'rgba(200,241,53,0.7)' : 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.08em', userSelect: 'none', lineHeight: 1, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
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
                  onMouseEnter={() => setHoveredRoomId(room.id)}
                  onMouseLeave={() => setHoveredRoomId(null)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, room.id)}
                  onDragOver={(e) => handleDragOver(e, room.id)}
                  onDragEnd={handleDragEnd}
                >
                  {/* Edit-room panel — rename + emoji change */}
                  {renamingRoomId === room.id && (
                    <div style={{ ...panelStyle, minWidth: 230 }}>
                      <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
                        Edit board
                      </div>
                      {/* Emoji selector */}
                      <div style={{ marginBottom: 10 }}>
                        <button
                          onClick={() => setEmojiPickerFor(pickerOpen ? null : room.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 12, background: pickerOpen ? 'rgba(200,241,53,0.10)' : 'rgba(255,255,255,0.06)', border: pickerOpen ? '1px solid rgba(200,241,53,0.3)' : '1px solid rgba(255,255,255,0.09)', cursor: 'pointer', transition: 'all 0.15s' }}
                        >
                          <span style={{ fontSize: 22, lineHeight: 1 }}>{getRoomEmoji(room)}</span>
                        </button>
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
                          style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 10px', color: '#ffffff', fontSize: 12, outline: 'none' }}
                        />
                        <button
                          onClick={() => { commitRename(); setEmojiPickerFor(null); setRenamingRoomId(null); }}
                          disabled={!renameValue.trim()}
                          style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 10, background: renameValue.trim() ? 'rgba(200,241,53,0.15)' : 'rgba(255,255,255,0.04)', border: renameValue.trim() ? '1px solid rgba(200,241,53,0.35)' : '1px solid rgba(255,255,255,0.08)', color: renameValue.trim() ? '#c8f135' : 'rgba(255,255,255,0.3)', cursor: renameValue.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
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
                      style={{ width: 44, height: 36, borderRadius: 13, background: active ? 'rgba(200,241,53,0.12)' : 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: active ? 22 : 20, transition: 'all 0.18s', position: 'relative', top: '-5px', filter: active ? 'none' : 'grayscale(0.2) opacity(0.7)' }}
                      onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.filter = 'none'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'; } }}
                      onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.filter = 'grayscale(0.2) opacity(0.7)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; } }}
                    >
                      {getRoomEmoji(room)}
                    </button>
                    {/* Delete button — shown on hover for non-active rooms when >1 room exists */}
                    {!active && rooms.length > 1 && hoveredRoomId === room.id && (
                      <button
                        onClick={e => { e.stopPropagation(); setDeleteConfirm({ id: room.id, name: room.name }); }}
                        title="Delete board"
                        style={{ position: 'absolute', top: -5, right: -5, width: 16, height: 16, borderRadius: '50%', background: 'rgba(255,60,60,0.85)', border: '1.5px solid rgba(10,11,22,0.9)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, zIndex: 10, lineHeight: 1, paddingBottom: 1 }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <span style={{ ...labelStyle, color: active ? 'rgba(200,241,53,0.7)' : 'rgba(255,255,255,0.28)', maxWidth: 72 }}>
                    {room.name.length > 11 ? room.name.slice(0, 10) + '…' : room.name}
                  </span>
                </div>
              );
            })}

            {/* Overflow menu */}
            {overflowRooms.length > 0 && (
              <div className="relative" ref={overflowRef} style={{ margin: '0 2px' }}
                onMouseEnter={() => { if (renamingRoomId && overflowRooms.some(r => r.id === renamingRoomId)) return; if (overflowCloseTimer.current) clearTimeout(overflowCloseTimer.current); setShowOverflow(true); }}
                onMouseLeave={() => { if (renamingRoomId && overflowRooms.some(r => r.id === renamingRoomId)) return; overflowCloseTimer.current = setTimeout(() => setShowOverflow(false), 150); }}
              >
                {/* Edit panel for overflow rooms — shown instead of overflow list */}
                {renamingRoomId && overflowRooms.some(r => r.id === renamingRoomId) && (() => {
                  const room = overflowRooms.find(r => r.id === renamingRoomId)!;
                  const pickerOpen = emojiPickerFor === room.id;
                  return (
                    <div style={{ ...panelStyle, minWidth: 230 }}>
                      <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
                        Edit board
                      </div>
                      {/* Emoji selector */}
                      <div style={{ marginBottom: 10 }}>
                        <button
                          onClick={() => setEmojiPickerFor(pickerOpen ? null : room.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 12, background: pickerOpen ? 'rgba(200,241,53,0.10)' : 'rgba(255,255,255,0.06)', border: pickerOpen ? '1px solid rgba(200,241,53,0.3)' : '1px solid rgba(255,255,255,0.09)', cursor: 'pointer', transition: 'all 0.15s' }}
                        >
                          <span style={{ fontSize: 22, lineHeight: 1 }}>{getRoomEmoji(room)}</span>
                        </button>
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
                          style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 10px', color: '#ffffff', fontSize: 12, outline: 'none' }}
                        />
                        <button
                          onClick={() => { commitRename(); setEmojiPickerFor(null); setRenamingRoomId(null); }}
                          disabled={!renameValue.trim()}
                          style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 10, background: renameValue.trim() ? 'rgba(200,241,53,0.15)' : 'rgba(255,255,255,0.04)', border: renameValue.trim() ? '1px solid rgba(200,241,53,0.35)' : '1px solid rgba(255,255,255,0.08)', color: renameValue.trim() ? '#c8f135' : 'rgba(255,255,255,0.3)', cursor: renameValue.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
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
                    <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, paddingLeft: 2 }}>Other boards</div>
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
                            style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: active ? 'rgba(200,241,53,0.12)' : 'rgba(255,255,255,0.03)', border: active ? '1px solid rgba(200,241,53,0.35)' : '1px solid transparent', color: active ? '#c8f135' : 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'all 0.15s', fontSize: 12, fontWeight: 600, textAlign: 'left' }}
                            onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLButtonElement).style.color = '#ffffff'; } }}
                            onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)'; } }}
                          >
                            <span style={{ fontSize: 18 }}>{getRoomEmoji(room)}</span>
                            {room.name}
                          </button>
                          {/* Gear edit button */}
                          <button
                            onClick={() => { startRenaming(room); setShowOverflow(false); }}
                            title="Edit board"
                            style={{ width: 26, height: 26, flexShrink: 0, borderRadius: 7, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#ffffff'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)'; }}
                          >
                            <CircleEllipsis size={13} strokeWidth={2} />
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
                    style={{ width: 44, height: 36, borderRadius: 13, background: (showOverflow || overflowRooms.some(r => r.id === currentRoomId) || (renamingRoomId != null && overflowRooms.some(r => r.id === renamingRoomId))) ? 'rgba(200,241,53,0.12)' : 'transparent', border: 'none', color: (showOverflow || overflowRooms.some(r => r.id === currentRoomId) || (renamingRoomId != null && overflowRooms.some(r => r.id === renamingRoomId))) ? '#c8f135' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s', position: 'relative', top: '-5px' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(200,241,53,0.12)'; (e.currentTarget as HTMLButtonElement).style.color = '#c8f135'; }}
                    onMouseLeave={e => { const isActive = showOverflow || overflowRooms.some(r => r.id === currentRoomId) || (renamingRoomId != null && overflowRooms.some(r => r.id === renamingRoomId)); (e.currentTarget as HTMLButtonElement).style.background = isActive ? 'rgba(200,241,53,0.12)' : 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = isActive ? '#c8f135' : 'rgba(255,255,255,0.5)'; }}
                  >
                    {(() => { const activeOverflow = overflowRooms.find(r => r.id === currentRoomId); return activeOverflow ? <span style={{ fontSize: 20, lineHeight: 1 }}>{getRoomEmoji(activeOverflow)}</span> : <MoreHorizontal size={18} strokeWidth={2} />; })()}
                  </button>
                  <span style={{ ...labelStyle, color: (showOverflow || overflowRooms.some(r => r.id === currentRoomId) || (renamingRoomId != null && overflowRooms.some(r => r.id === renamingRoomId))) ? 'rgba(200,241,53,0.7)' : 'rgba(255,255,255,0.28)' }}>More</span>
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
                  style={{ width: 44, height: 36, borderRadius: 13, background: showAddWs ? 'rgba(200,241,53,0.12)' : 'transparent', border: 'none', color: showAddWs ? '#c8f135' : 'rgba(255,255,255,0.35)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s', position: 'relative', top: '-5px' }}
                  onMouseEnter={e => { if (!showAddWs) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLButtonElement).style.color = '#ffffff'; } }}
                  onMouseLeave={e => { if (!showAddWs) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)'; } }}
                >
                  <LayersPlus size={16} strokeWidth={2.5} />
                </button>
                <span style={labelStyle}>New</span>
              </div>
            </div>
          </div>
        )}

        <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

        {/* Undo / Redo */}
        {[
          { icon: <Undo2 size={18} strokeWidth={2} />, action: undo, enabled: canUndo, label: '⌘Z' },
          { icon: <Redo2 size={18} strokeWidth={2} />, action: redo, enabled: canRedo, label: '⌘⇧Z' },
        ].map((item) => (
          <button key={item.label} onClick={item.action} disabled={!item.enabled} title={item.label}
            style={{ width: 36, height: 36, borderRadius: 10, background: 'transparent', border: 'none', color: item.enabled ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.18)', cursor: item.enabled ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
            onMouseEnter={e => { if (!item.enabled) return; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLButtonElement).style.color = '#ffffff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = item.enabled ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.18)'; }}
          >
            {item.icon}
          </button>
        ))}

        <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

        {/* Primary + bookmark */}
        <button onClick={handleAddBookmark}
          style={{ width: 52, height: 52, borderRadius: 18, background: '#c8f135', color: '#0a0b16', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(200,241,53,0.5), 0 0 8px rgba(200,241,53,0.3)', border: 'none', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s cubic-bezier(.34,1.56,.64,1)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.12)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 36px rgba(200,241,53,0.7), 0 0 12px rgba(200,241,53,0.4)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 24px rgba(200,241,53,0.5), 0 0 8px rgba(200,241,53,0.3)'; }}
          onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.94)'; }}
          onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.12)'; }}
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>

        <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

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
            {hasActiveFilters && <span style={{ position: 'absolute', top: 2, right: 2, width: 7, height: 7, borderRadius: '50%', background: '#c8f135', border: '1.5px solid rgba(10,11,22,0.9)' }} />}
          </button>
          <span style={{ ...labelStyle, color: hasActiveFilters ? 'rgba(200,241,53,0.7)' : 'rgba(255,255,255,0.28)' }}>Tags</span>
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
          <span style={{ ...labelStyle, color: showSearch ? 'rgba(200,241,53,0.7)' : 'rgba(255,255,255,0.28)' }}>Search</span>
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
          <span style={{ ...labelStyle, color: showSettings ? 'rgba(200,241,53,0.7)' : 'rgba(255,255,255,0.28)' }}>Settings</span>
        </div>
      </div>
    </div>
    </>
  );
};

export default Toolbar;
