"""Build reviewed flashcards for Vaughan Intensive English, book 01.

Each source line is: PDF page<TAB>Spanish prompt<TAB>English answer.
The PDF and OCR text stay under sources/english/ and are not bundled.
"""

import json
from pathlib import Path

BOOK_ID = 'vaughan-intensive-english-01'
BOOK_TITLE = 'Vaughan Intensive English — Libro 1'
OUTPUT = Path(__file__).resolve().parents[1] / 'src' / 'data' / BOOK_ID

BASIC = '''
6	Compro pescado en el supermercado.	I buy fish at the supermarket.
6	Compro fruta en el supermercado.	I buy fruit at the supermarket.
6	Compro pan en el supermercado.	I buy bread at the supermarket.
6	Compro una naranja todos los días.	I buy an orange every day.
6	Ella compra una naranja todos los días.	She buys an orange every day.
6	Él compra una naranja todos los días.	He buys an orange every day.
7	Ella siempre compra pescado en el supermercado.	She always buys fish at the supermarket.
7	Ella siempre compra fruta en el supermercado.	She always buys fruit at the supermarket.
7	Ella siempre compra pan en el supermercado.	She always buys bread at the supermarket.
7	Mi hermana compra pescado en el supermercado.	My sister buys fish at the supermarket.
7	Mi hermana compra fruta en el supermercado.	My sister buys fruit at the supermarket.
7	Mi hermana compra pan en el supermercado.	My sister buys bread at the supermarket.
7	Compro pescado los lunes.	I buy fish on Mondays.
7	Él compra fruta los lunes.	He buys fruit on Mondays.
7	Ella compra pan los lunes.	She buys bread on Mondays.
8	La gente no compra pescado en el dentista.	People don't buy fish at the dentist.
8	La gente no compra fruta en la carnicería.	People don't buy fruit at the butcher's.
8	La gente no compra pan en el médico.	People don't buy bread at the doctor's.
8	Él no compra aceite de oliva todos los días.	He doesn't buy olive oil every day.
8	Él no compra fruta todos los días.	He doesn't buy fruit every day.
8	Él no compra vino todos los días.	He doesn't buy wine every day.
9	No compramos mucho vino.	We don't buy much wine.
9	No compramos mucha fruta.	We don't buy much fruit.
9	No compramos mucha carne.	We don't buy much meat.
9	Los británicos no compran mucho aceite de oliva.	The British don't buy much olive oil.
9	Los británicos no compran mucho jamón ibérico.	The British don't buy much Iberian ham.
9	Los británicos no compran mucho pescado.	The British don't buy much fish.
9	Ella nunca compra pescado en el supermercado.	She never buys fish at the supermarket.
9	Ella nunca compra fruta en el supermercado.	She never buys fruit at the supermarket.
9	Ella nunca compra pan en el supermercado.	She never buys bread at the supermarket.
10	¿Compras un coche todos los años?	Do you buy a car every year?
10	¿Compras una naranja todos los días?	Do you buy an orange every day?
10	¿Compras pescado en el supermercado?	Do you buy fish at the supermarket?
10	¿Compras mucho aceite de oliva?	Do you buy much olive oil?
10	¿Compras mucha fruta?	Do you buy much fruit?
10	¿Compras mucho vino?	Do you buy much wine?
11	¿Él compra pan todos los días?	Does he buy bread every day?
11	¿Él compra regalos todas las semanas?	Does he buy presents every week?
11	¿Él compra sushi los lunes?	Does he buy sushi on Mondays?
11	¿Ella compra comida los fines de semana?	Does she buy food at the weekend?
11	¿Ella compra ropa los fines de semana?	Does she buy clothes at the weekend?
11	¿Ella compra pan los fines de semana?	Does she buy bread at the weekend?
11	¿Compran mucha fruta los americanos?	Do the Americans buy much fruit?
11	¿Compran mucho aceite de oliva los americanos?	Do the Americans buy much olive oil?
11	¿Compran mucho vino los americanos?	Do the Americans buy much wine?
14	Hay una manzana.	There's an apple.
14	Hay una uva.	There's a grape.
14	Hay una naranja.	There's an orange.
14	Hay una cebolla.	There's an onion.
14	Una manzana.	An apple.
14	Una uva.	A grape.
14	Una piña.	A pineapple.
14	Una fresa.	A strawberry.
14	Una zanahoria.	A carrot.
14	Un pimiento.	A pepper.
14	Un tomate.	A tomato.
14	Una patata.	A potato.
16	Estoy comprando un libro.	I'm buying a book.
16	Estoy comprando un bolígrafo.	I'm buying a pen.
16	Estoy comprando un coche.	I'm buying a car.
16	Estoy comprando pescado en el supermercado.	I'm buying some fish at the supermarket.
16	Estoy comprando fruta en el supermercado.	I'm buying some fruit at the supermarket.
16	Estoy comprando pan en el supermercado.	I'm buying some bread at the supermarket.
17	Estoy comprando unas flores.	I'm buying some flowers.
17	Estoy comprando unos libros.	I'm buying some books.
17	Estoy comprando unos sellos.	I'm buying some stamps.
17	Él está comprando unas cosas.	He's buying some things.
17	Él está comprando unas postales.	He's buying some postcards.
17	Él está comprando unos sobres.	He's buying some envelopes.
17	Ella está comprando unos sobres en la papelería.	She's buying some envelopes at the stationer's.
17	Ella está comprando papel en la papelería.	She's buying some paper at the stationer's.
17	Ella está comprando unas cosas en la papelería.	She's buying some things at the stationer's.
18	No estoy comprando un libro.	I'm not buying a book.
18	No estoy comprando un bolígrafo.	I'm not buying a pen.
18	No estoy comprando un piso.	I'm not buying a flat.
18	No estoy comprando pan.	I'm not buying any bread.
18	No estoy comprando fruta.	I'm not buying any fruit.
18	No estoy comprando vino.	I'm not buying any wine.
19	No estoy comprando flores.	I'm not buying any flowers.
19	No estoy comprando libros.	I'm not buying any books.
19	No estoy comprando sellos.	I'm not buying any stamps.
19	Ella no está comprando pan.	She isn't buying any bread.
19	Ella no está comprando queso.	She isn't buying any cheese.
19	Ella no está comprando vino.	She isn't buying any wine.
19	Él no está comprando pescado.	He isn't buying any fish.
19	Él no está comprando fruta.	He isn't buying any fruit.
19	Él no está comprando vegetales.	He isn't buying any vegetables.
20	¿Estás comprando una bici?	Are you buying a bike?
20	¿Estás comprando una bebida?	Are you buying a drink?
20	¿Estás comprando un vestido?	Are you buying a dress?
20	¿Estás comprando queso?	Are you buying any cheese?
20	¿Estás comprando tomates?	Are you buying any tomatoes?
20	¿Estás comprando pasta?	Are you buying any pasta?
21	¿Qué estás comprando?	What are you buying?
21	¿Qué estás comprando ahora?	What are you buying now?
21	¿Qué estás comprando en el supermercado?	What are you buying at the supermarket?
21	¿Qué está él comprando?	What's he buying?
21	¿Qué está él comprando ahora?	What's he buying now?
21	¿Qué está él comprando en el supermercado?	What's he buying at the supermarket?
21	¿Qué está ella comprando?	What's she buying?
21	¿Qué está ella comprando ahora?	What's she buying now?
21	¿Qué está ella comprando en el supermercado?	What's she buying at the supermarket?
24	¿Para quién estás comprando las flores?	Who are you buying the flowers for?
24	Estoy comprando las flores para mi hermana.	I'm buying the flowers for my sister.
24	¿Por qué le estás comprando flores a tu hermana?	Why are you buying your sister flowers?
24	Le estoy comprando flores porque es su cumpleaños.	I'm buying my sister flowers because it's her birthday.
24	¿Siempre le compras flores a tu hermana por su cumpleaños?	Do you always buy your sister flowers for her birthday?
24	Sí, siempre le compro flores a mi hermana por su cumpleaños.	Yes, I always buy my sister flowers for her birthday.
24	¿Qué fruta estás comprando?	What fruit are you buying?
24	Estoy comprando naranjas y manzanas.	I'm buying some oranges and some apples.
24	¿Siempre compras naranjas y manzanas?	Do you always buy oranges and apples?
24	No, a veces compro plátanos y peras.	No, sometimes I buy bananas and pears.
27	Yo te invito a una copa. (Ofrecimiento en un bar)	I'll buy you a drink.
'''

INTERMEDIATE = '''
34	Compré un libro para mi hermana.	I bought a book for my sister.
34	Él compró un CD para su mujer.	He bought a CD for his wife.
34	Ella compró un regalo para su amiga.	She bought a present for her friend.
34	Compramos un coche nuevo.	We bought a new car.
34	Ellos compraron un ordenador nuevo.	They bought a new computer.
34	Ella compró un vestido nuevo.	She bought a new dress.
35	Ed compró un zumo de naranja para desayunar.	Ed bought an orange juice for breakfast.
35	Olga compró una ensalada de berenjena para comer.	Olga bought an eggplant salad for lunch.
35	Alan compró una tarta de manzana para cenar.	Alan bought an apple pie for dinner.
35	Carl compró un coche ayer.	Carl bought a car yesterday.
35	Diana compró un vestido ayer.	Diana bought a dress yesterday.
35	Nick y Laura compraron un ordenador ayer.	Nick and Laura bought a computer yesterday.
35	Jack compró una chaqueta muy bonita ayer.	Jack bought a really nice jacket yesterday.
35	Jim compró un jersey muy bonito ayer.	Jim bought a really nice jumper yesterday.
35	Shirley compró una camisa muy bonita ayer.	Shirley bought a really nice shirt yesterday.
36	No compré nada en las tiendas ayer.	I didn't buy anything at the shops yesterday.
36	Steve no compró nada en la farmacia.	Steve didn't buy anything at the chemist's.
36	Sarah tampoco compró nada en la farmacia.	Sarah didn't buy anything at the chemist's either.
36	No compraron suficientes adornos para el árbol de Navidad.	They didn't buy enough decorations for the Christmas tree.
36	No compré suficientes sellos para enviar esto a Polonia.	I didn't buy enough stamps to send this to Poland.
36	No compramos suficiente bebida para la fiesta.	We didn't buy enough drinks for the party.
37	No compré mucho en la carnicería.	I didn't buy much at the butcher's.
37	John tampoco compró mucho en la carnicería.	John didn't buy much at the butcher's either.
37	No compramos mucho al final.	We didn't buy much in the end.
37	No compré mucha carne en la carnicería.	I didn't buy much meat at the butcher's.
37	Ella no compró mucho pescado en la pescadería.	She didn't buy much fish at the fishmonger's.
37	No compraron mucha agua mineral en el supermercado.	They didn't buy much mineral water at the supermarket.
37	Al final él no compró tanto.	In the end, he didn't buy that much.
37	Al final no compraron tanto en las rebajas.	In the end, they didn't buy that much at the sales.
37	Al final no compramos tanto porque estábamos cansados.	In the end, we didn't buy that much because we were tired.
38	¿Compraste suficiente comida para esta noche?	Did you buy enough food for tonight?
38	¿Me compraste algo en Londres?	Did you buy anything for me in London?
38	¿Compraste mucha carne en el supermercado?	Did you buy much meat at the supermarket?
38	¿Compraste un sello para tu carta?	Did you buy a stamp for your letter?
38	¿Compraste un bocadillo para comer?	Did you buy a sandwich for lunch?
38	¿Compraste un regalo para tu madre?	Did you buy a present for your mother?
39	¿Qué compraron ayer?	What did they buy yesterday?
39	¿Susan compró suficiente vino ayer?	Did Susan buy enough wine yesterday?
39	¿Paul compró algo ayer?	Did Paul buy anything yesterday?
39	¿Sam compró algo en la tienda del aeropuerto?	Did Sam buy anything at the airport shop?
39	¿Compraste algo para mí ayer?	Did you buy anything for me yesterday?
39	¿Compraron algo en la pescadería?	Did they buy anything at the fishmonger's?
39	¿Compraste algo al final?	Did you buy anything in the end?
39	¿Qué compró Tina al final?	What did Tina buy in the end?
39	¿Ella compró aquel vestido rojo al final?	Did she buy that red dress in the end?
42	Un cinturón.	A belt.
42	Un traje.	A suit.
42	Una corbata.	A tie.
42	Una camisa.	A shirt.
42	Una bata.	A dressing-gown.
42	Una falda.	A skirt.
42	Una gabardina.	A rain coat.
42	Unas zapatillas de casa.	Some slippers.
42	Un pijama.	Some pyjamas.
42	Unas zapatillas deportivas.	Some trainers.
42	Ella se está probando un cinturón.	She's trying on a belt.
42	Él se está probando un traje.	He's trying on a suit.
44	He comprado tres libros este mes.	I've bought three books this month.
44	He comprado diez DVD este mes.	I've bought ten DVDs this month.
44	He comprado siete pares de zapatos este año.	I've bought seven pairs of shoes this year.
44	Ella ha comprado muchas cosas hoy.	She's bought a lot of things today.
44	Ella ha comprado cinco blusas este año.	She's bought five blouses this year.
44	Ella ha comprado tres vestidos también.	She's bought three dresses too.
45	Él ha comprado un neumático nuevo para su bici.	He's bought a new tire for his bike.
45	¡Él ha comprado otra corbata!	He's bought another tie!
45	¡Él ha comprado enjuague bucal por fin!	He's bought some mouthwash at last!
45	He comprado diez pares de calcetines esta semana.	I've bought ten pairs of socks this week.
45	Ella ha comprado mucha comida esta semana.	She's bought a lot of food this week.
45	Él ha comprado unas cosas para su coche esta semana.	He's bought some things for his car this week.
45	He comprado veinte cafés en lo que va de semana.	I've bought twenty coffees so far this week.
45	Él ha comprado cuatro paquetes de cigarrillos en lo que va de semana.	He's bought four packets of cigarettes so far this week.
45	Ella ha comprado seis botellas de cerveza en lo que va de semana.	She's bought six bottles of beer so far this week.
46	No compro leche desde hace días.	I haven't bought any milk for days.
46	No compro pan desde hace días.	I haven't bought any bread for days.
46	No compro cereales desde hace días.	I haven't bought any cereal for days.
46	Él no compra vino desde hace semanas.	He hasn't bought any wine for weeks.
46	Él no compra ningún CD desde hace semanas.	He hasn't bought any CDs for weeks.
46	Él no compra ningún libro desde hace semanas.	He hasn't bought any books for weeks.
47	No compran cigarrillos desde hace años.	They haven't bought any cigarettes for years.
47	No compran alcohol desde hace años.	They haven't bought any alcohol for years.
47	No compran chocolate desde hace años.	They haven't bought any chocolate for years.
47	No compro nada de ropa desde hace tiempo.	I haven't bought any clothes for a long time.
47	No compro nada de café desde hace tiempo.	I haven't bought any coffee for a long time.
47	No compro joyas desde hace tiempo.	I haven't bought any jewelry for a long time.
47	Ella no compra vino desde hace mucho tiempo.	She hasn't bought any wine for ages.
47	Ella no compra ningún CD desde hace mucho tiempo.	She hasn't bought any CDs for ages.
47	Ella no compra ningún libro desde hace mucho tiempo.	She hasn't bought any books for ages.
48	¿Me has comprado un regalo alguna vez?	Have you ever bought me a present?
48	¿Le has comprado alguna vez un anillo a tu mujer?	Have you ever bought your wife a ring?
48	¿Le has comprado alguna vez un coche a tu hijo?	Have you ever bought your son a car?
48	¿Te ha invitado ella a desayunar alguna vez?	Has she ever bought you breakfast?
48	¿Ha invitado ella alguna vez a su hermano a comer?	Has she ever bought her brother lunch?
48	¿Ha invitado ella alguna vez a su hermana a cenar?	Has she ever bought her sister dinner?
49	¿Te ha invitado él a un café alguna vez?	Has he ever bought you a coffee?
49	¿Te ha invitado él alguna vez a una cerveza?	Has he ever bought you a beer?
49	¿Te ha invitado él alguna vez a una copa?	Has he ever bought you a drink?
49	¿Qué le has comprado a él?	What have you bought him?
49	¿Qué les has comprado a ellos?	What have you bought them?
49	¿Qué le has comprado a ella?	What have you bought her?
49	¿Qué me ha comprado él?	What's he bought for me?
49	¿Qué te ha comprado él?	What's he bought for you?
49	¿Qué les ha comprado él a ellos?	What's he bought for them?
52	¿Compraste la bebida para la fiesta de esta noche?	Did you buy the drink for the party tonight?
52	¿Qué bebida compraste?	What drink did you buy?
52	Compré vino y cerveza.	I bought some wine and I bought some beer.
52	¿Compraste zumo de fruta?	Did you buy any fruit juice?
52	Compré zumo de naranja y zumo de piña.	I bought some orange juice and I bought some pineapple juice.
52	¿No compraste zumo de manzana?	Didn't you buy any apple juice?
52	No, no compré zumo de manzana.	No, I didn't buy any apple juice.
52	¿Compro zumo de manzana ahora?	Shall I buy some apple juice now?
52	¿Compraste comida?	Did you buy any food?
52	Compré unos aperitivos.	I bought some snacks.
52	¿Qué aperitivos compraste?	What snacks did you buy?
52	Compré aceitunas y patatas fritas de bolsa.	I bought some olives and some potato chips.
52	¿Compraste queso?	Did you buy any cheese?
52	Compré queso y también jamón.	I bought some cheese and some ham too.
52	Ahora me debes sesenta dólares.	Now you owe me sixty dollars!
52	¿No puedo invitarte a una copa en vez de eso?	Can't I buy you a drink instead?
52	¿Me estás tomando el pelo?	Are you pulling my leg?
'''

ADVANCED = '''
62	No me gusta el ajo, pero sí me gusta la cebolla.	I don't like garlic, but I do like onion.
62	No compro revistas todos los días, pero sí compro el periódico a diario.	I don't buy magazines every day, but I do buy the paper on a daily basis.
62	No compro mucha ropa de diseño, pero sí compro corbatas de diseño.	I don't buy many designer clothes, but I do buy designer ties.
62	Ella no suele comprar zapatos, pero sí los compra cuando hay rebajas.	She doesn't normally buy shoes, but she does buy them when the sales are on.
62	No compré cacahuetes, pero sí compré unos anacardos.	I didn't buy any peanuts, but I did buy some cashew nuts.
62	No le compré un regalo de cumpleaños, pero sí le compré una tarjeta.	I didn't buy him a birthday present, but I did buy him a birthday card.
62	Él no compró tornillos, pero sí compró unos clavos.	He didn't buy any screws, but he did buy some nails.
63	Aún no han comprado los tomates, pero sí han comprado los calabacines.	They haven't bought the tomatoes yet, but they have bought the courgettes.
63	Aún no he comprado las berenjenas, pero sí he comprado el apio.	I haven't bought the aubergines yet, but I have bought the celery.
63	Aún no hemos comprado las ciruelas, pero sí hemos comprado las cerezas.	We haven't bought the plums yet, but we have bought the cherries.
63	Él aún no ha cenado, pero sí ha tomado un aperitivo.	He hasn't had his dinner yet, but he has had an aperitif.
63	Él aún no ha comprado canela, pero sí ha comprado cacao en polvo.	He hasn't bought any cinnamon yet, but he has bought some cocoa powder.
63	Él aún no ha comprado harina con levadura, pero sí ha comprado harina normal.	He hasn't bought any self-raising flour yet, but he has bought some plain flour.
63	Ella aún no ha comprado azúcar moreno, pero sí ha comprado azúcar glas.	She hasn't bought any brown sugar yet, but she has bought some icing sugar.
63	No iré a la oficina esta noche, pero sí iré mañana por la mañana.	I won't go to the office tonight, but I will go tomorrow morning.
63	Ella no comprará más este mes, pero sí comprará más el mes que viene.	She won't buy any more this month, but she will buy some more next month.
63	No le comprarán un reloj esta vez, pero sí uno para su próximo cumpleaños.	They won't buy him a watch this time round, but they will buy him one for his next birthday.
64	Jim compra el periódico cada día a pesar de que casi nunca lo lee.	Jim buys the paper every day even though he hardly ever reads it.
64	Janet compró otras gafas de sol a pesar de que ya tiene por lo menos diez pares en casa.	Janet bought another pair of sunglasses even though she already has at least ten pairs at home.
64	A Jake le gusta comprar libros a pesar de que nunca tiene tiempo de leerlos.	Jake likes to buy books even though he never has time to read them.
64	Pedro compra paraguas a pesar de que apenas llueve donde vive.	Pedro buys umbrellas despite the fact that it hardly ever rains where he lives.
64	Fred siempre compra el teléfono más caro del mercado a pesar de que nunca lo utiliza.	Fred always buys the most expensive phone on the market despite the fact that he never uses it.
64	Alguna gente todavía compra CDs a pesar de que suele ser más barato descargarlos.	Some people still buy CDs despite the fact that it's usually cheaper to download them.
65	Él acabó comprándolo a pesar de que realmente no lo necesitaba.	He ended up buying it in spite of the fact that he didn't really need it.
65	Todavía compro LPs a pesar de que nunca los escucho.	I still buy LPs in spite of the fact that I never listen to any of them.
65	Compré un cuadro que me costó tres mil euros a pesar de que probablemente sólo vale mil.	I bought a picture that cost me three thousand euros in spite of the fact that it's probably only worth one thousand.
65	Compré un jarrón antiguo a pesar de que estaba cascado.	I bought an antique vase notwithstanding the fact that it was chipped.
65	Mi madre compró un billete para dar la vuelta al mundo a pesar de que tiene miedo a volar.	My mother bought a round-the-world ticket notwithstanding the fact that she's afraid of flying.
65	Lo compré a pesar de que costó un dineral.	I bought it regardless of the fact that it cost a bomb.
65	Él lo compró a pesar de que costó un ojo de la cara.	He bought it regardless of the fact that it cost an arm and a leg.
65	Lo compraron a pesar de que costó una fortuna.	They bought it regardless of the fact that it cost a fortune.
66	Tengo dinero suficiente para comprar un piso de dos dormitorios en las afueras.	I can afford to buy a two-bedroom flat on the outskirts of town.
66	Tengo dinero suficiente para comprar un piso de un dormitorio en el centro.	I can afford to buy a one-bedroom flat in the centre of town.
66	No me lo puedo permitir con mi sueldo.	I can't afford it on my salary.
66	George no se puede permitir un coche nuevo.	George can't afford a new car.
66	Sheila no se puede permitir un entrenador personal.	Sheila can't afford a personal trainer.
67	¿Tus padres pueden permitirse comprar una casa en la Toscana?	Can your parents afford to buy a house in Tuscany?
67	¿Podemos permitirnos comprar otra lavadora?	Can we afford to buy another washing machine?
67	¿Alfred realmente puede permitirse ese Rolex?	Can Alfred really afford that Rolex?
67	¿Él puede permitirse todas esas acciones?	Can he afford all those shares?
67	¿Tus padres pueden permitirse viajar dos veces al año?	Can your parents afford to go away twice a year?
67	¿Por qué no tienes dinero para venir con nosotros?	Why can't you afford to come with us?
67	¿Por qué no tienes dinero para salir a cenar?	Why can't you afford to come out for dinner?
67	¿Por qué no tienes dinero para que te arreglen el coche?	Why can't you afford to get your car fixed?
68	Me compré un vestido muy bonito ayer.	I bought myself a nice dress yesterday.
69	Me dio una excusa por no venir al trabajo, pero no me la tragué.	He gave me some excuse about why he didn't come to work, but I didn't buy it.
69	¡No puedo creer que se tragara todas esas tonterías!	I can't believe he bought into all that rubbish!
69	Nunca me creo nada de lo que dicen esos tipos.	I never buy anything those guys say.
70	Una plancha.	An iron.
70	Un cortacésped.	A lawnmower.
70	Un pincel.	A paintbrush.
70	Una escalera.	A ladder.
70	Un martillo.	A hammer.
70	Una tabla de planchar.	An ironing board.
70	Una fregona.	A mop.
70	Una manguera.	A hose.
70	Una aspiradora.	A vacuum cleaner.
70	Un clavo.	A nail.
70	Hacer tareas de limpieza.	To do some cleaning.
70	Hacer labores de jardinería.	To do some gardening.
72	¿Dónde compraste esa camisa?	Where did you get that shirt from?
72	La compré en las rebajas de verano.	I got it at the summer sales.
72	¿Me puedes comprar jengibre cuando estés en el supermercado?	Can you get me some ginger while you're at the supermarket?
72	Compré una casa la semana pasada.	I purchased a house last week.
72	Compré un coche nuevo hace tres semanas.	I purchased a new car three weeks ago.
72	Compré un yate valorado en trescientos mil euros.	I purchased a yacht worth three hundred thousand euros.
73	Tras meses de negociación, adquirí los derechos para pescar en el lago.	After months of negotiation, I acquired the rights to fish in the lake.
73	Acabo de adquirir varias propiedades en Dubái.	I've just acquired several properties in Dubai.
73	Estoy intentando adquirir alguna propiedad en el centro de Londres.	I'm trying to acquire some property in central London.
73	Compré estas sandalias en las rebajas.	I picked these sandals up in the sales.
73	Él compró aquel jeep a un precio muy razonable.	He picked up that jeep at a really reasonable price.
73	Te sorprendería lo que puedes encontrar en un rastro.	You'd be surprised what you can pick up at a flea market.
73	Sólo quedaban dos. ¡No podía dejarlos escapar!	There were only two left. I just had to snap them up!
73	Yo compraría tantos como puedas antes de que se agoten.	I'd snap up as many as you can before they run out of stock.
73	¡Cómpralo ya!	Snap it up quick!
74	Tenemos unos cuantos empresarios chinos interesados en comprar una participación en nuestra empresa.	We have a number of Chinese businessmen interested in buying into our company.
74	¿En qué empresa estás pensando comprar una participación?	Which company are you thinking about buying into?
74	Estás asumiendo un riesgo considerable al comprar una participación en esa empresa.	You're taking a considerable risk by buying into that company.
74	¿Quién te va a comprar tu parte de la empresa?	Who's going to buy you out?
74	Necesito encontrar a alguien para comprar mi parte lo antes posible.	I need to find someone to buy me out as soon as possible.
74	Si encuentro a alguien que compre mi parte, mis problemas se solucionarán.	If I can find someone to buy me out, my problems will be solved.
75	Mi cuñada ha comprado todos los envases de leche de la tienda.	My sister-in-law bought up all the cartons of milk in the store.
75	La empresa de Trevor compró todas las acciones de TeliMónica que quedaban.	Trevor's company bought up all the remaining TeliMónica shares.
75	Al final no hacía falta comprarlo todo.	In the end there was no need to buy up everything.
75	Todo el mundo está comprando grandes cantidades de gasolina por la situación en Oriente Medio.	Everyone's buying in large amounts of petrol due to the situation in the Middle East.
75	Estoy comprando mucha comida por si nos quedamos aislados por la nieve.	I'm buying lots of food in in case we get snowed-in.
75	Compra suministros, por si acaso. El pronóstico no tiene buena pinta.	Buy in supplies just in case. The forecast isn't looking good!
75	Alguien está intentando sobornarle.	Someone is trying to buy him off.
75	¿Alguna vez ha intentado sobornarte alguien?	Has anyone ever tried to buy you off?
75	Tengo la sospecha de que alguien le sobornó.	I have a sneaking suspicion that someone bought him off.
76	Estoy seguro de que él te va a pedir que lo pagues al contado.	I'm sure he's going to ask you to pay for it up front.
76	No puedo creer que ellos quisieran que lo pagaras al contado.	I can't believe they wanted you to pay for it up front.
76	Si el vendedor me pide que lo pague al contado, ¡le mandaré a paseo!	If the seller asks me to pay for it up front, I'll tell him where to go!
76	No tengo más remedio que pagar a plazos.	I have no choice but to pay in installments.
76	¿Cuánto más me costará al final si pago a plazos?	How much more will it cost me in the end if I pay in installments?
76	Si puedes evitar pagar a plazos, mucho mejor.	If you can avoid paying in installments, all the better.
77	¿Llevas dinero encima?	Have you got any cash on you?
77	Estoy sin blanca ahora mismo.	I'm out of cash right now.
77	Voy al cajero a sacar dinero.	I'm going to the hole in the wall to get some cash out.
77	El vendedor nos dijo que teníamos que pagarlo en efectivo.	The seller told us that we had to pay for it in cash.
77	No lo pagues en efectivo a no ser que tengas que hacerlo.	Don't pay for it in cash unless you have to.
77	¿Pagaste el coche en efectivo?	Did you pay for the car in cash?
77	Mi suegra paga todo con tarjeta de crédito.	My mother-in-law pays for everything by credit card.
77	¿No te dejaron pagarlo con tarjeta de crédito?	Didn't they let you pay for it by credit card?
77	¿Es seguro pagar las cosas con tarjeta de crédito por internet?	Is it safe to pay for things by credit card over the internet?
77	En la recesión de los años treinta, gran parte de la mano de obra agrícola fue pagada en especie.	During the recession in the thirties, many farm labourers were paid in kind.
77	¿Qué quieres decir con que fueron pagados en especie?	What do you mean they were paid in kind?
77	En lugar de recibir dinero, llevaron a casa parte del maíz que cosecharon.	Instead of receiving cash, they took home some of the corn they harvested.
80	¿Por qué compraste esa chaqueta tan horrible?	Why on earth did you buy that awful jacket?
80	Parece algo que encontrarías en un rastro por un dólar.	It looks like something you'd pick up at a flea market for a dollar.
80	Esta chaqueta me costó un ojo de la cara.	This jacket cost me an arm and a leg.
80	Parece que va a deshacerse en cualquier momento.	It looks like it's gonna come apart at any minute.
80	Esta chaqueta ha sido confeccionada por los mejores sastres de Londres.	This jacket has been crafted by London's finest tailors.
80	El aspecto gastado es el último grito.	The 'worn' look is all the rage.
80	¿No te dan ganas de coger unas tijeras y darle un buen recorte?	Doesn't it make you want to get hold of the nearest pair of scissors and give it a good trim?
80	Creo que puedo resistir la tentación.	I think I can resist the temptation!
80	Tu chaqueta tampoco es precisamente alta costura.	Your jacket is hardly haute couture, is it?
80	Estoy seguro de que costó una fracción del precio de la tuya.	I'm sure it cost a fraction of the price of yours.
80	Es cómoda y calentita, y no me costó un dineral.	It's comfy 'n' warm, and it didn't cost me the earth.
84	Todavía están buscando comprador para su casa.	They're still looking for a buyer.
84	Compra hasta caer rendido.	Shop 'til you drop.
'''


def build_cards(source, level, first_page, last_page):
    cards = []
    seen = set()
    for line in source.strip().splitlines():
        page, front, back = line.split('\t')
        page = int(page)
        if not first_page <= page <= last_page:
            raise ValueError(f'Page {page} is outside level {level}')
        if front in seen:
            raise ValueError(f'Duplicate prompt in level {level}: {front}')
        seen.add(front)
        cards.append({
            'id': f's{level}-{len(cards) + 1:03}',
            'front': front,
            'back': back,
            'sourcePage': page,
        })
    return cards


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for number, (slug, name, source, first_page, last_page) in enumerate([
        ('basico', 'Nivel básico', BASIC, 4, 31),
        ('intermedio', 'Nivel intermedio', INTERMEDIATE, 32, 59),
        ('avanzado', 'Nivel avanzado', ADVANCED, 60, 87),
    ], 1):
        cards = build_cards(source, number, first_page, last_page)
        if not cards:
            continue
        data = {
            'bookId': BOOK_ID,
            'bookTitle': BOOK_TITLE,
            'language': 'en',
            'sektionId': f'nivel-{slug}',
            'sektionTitle': name,
            'order': number,
            'cards': cards,
        }
        path = OUTPUT / f'nivel-{number}.json'
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
        print(f'{path}: {len(cards)} cards')


if __name__ == '__main__':
    main()
