--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'ONGOING',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: MenuItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MenuItem" (
    id integer NOT NULL,
    name text NOT NULL,
    "itemNumber" text NOT NULL,
    "imageUrl" text,
    price double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MenuItem" OWNER TO postgres;

--
-- Name: MenuItem_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."MenuItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."MenuItem_id_seq" OWNER TO postgres;

--
-- Name: MenuItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."MenuItem_id_seq" OWNED BY public."MenuItem".id;


--
-- Name: Order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Order" (
    id integer NOT NULL,
    "tableId" integer,
    "isParcel" boolean DEFAULT false NOT NULL,
    status public."OrderStatus" DEFAULT 'ONGOING'::public."OrderStatus" NOT NULL,
    discount double precision DEFAULT 0 NOT NULL,
    total double precision NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "kitchenPrinted" boolean DEFAULT false NOT NULL,
    "customerPrinted" boolean DEFAULT false NOT NULL,
    "sendStatement" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Order" OWNER TO postgres;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderItem" (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    "menuItemId" integer NOT NULL,
    quantity integer NOT NULL,
    price double precision NOT NULL
);


ALTER TABLE public."OrderItem" OWNER TO postgres;

--
-- Name: OrderItem_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."OrderItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."OrderItem_id_seq" OWNER TO postgres;

--
-- Name: OrderItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."OrderItem_id_seq" OWNED BY public."OrderItem".id;


--
-- Name: Order_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Order_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Order_id_seq" OWNER TO postgres;

--
-- Name: Order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Order_id_seq" OWNED BY public."Order".id;


--
-- Name: ReportSendingTime; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ReportSendingTime" (
    id integer NOT NULL,
    "time" text NOT NULL
);


ALTER TABLE public."ReportSendingTime" OWNER TO postgres;

--
-- Name: ReportSendingTime_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ReportSendingTime_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ReportSendingTime_id_seq" OWNER TO postgres;

--
-- Name: ReportSendingTime_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ReportSendingTime_id_seq" OWNED BY public."ReportSendingTime".id;


--
-- Name: Statement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Statement" (
    id integer NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "totalSale" double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Statement" OWNER TO postgres;

--
-- Name: Statement_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Statement_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Statement_id_seq" OWNER TO postgres;

--
-- Name: Statement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Statement_id_seq" OWNED BY public."Statement".id;


--
-- Name: Table; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Table" (
    id integer NOT NULL,
    number text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Table" OWNER TO postgres;

--
-- Name: Table_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Table_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Table_id_seq" OWNER TO postgres;

--
-- Name: Table_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Table_id_seq" OWNED BY public."Table".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    phone text NOT NULL,
    password text NOT NULL,
    name text,
    pin text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: MenuItem id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MenuItem" ALTER COLUMN id SET DEFAULT nextval('public."MenuItem_id_seq"'::regclass);


--
-- Name: Order id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order" ALTER COLUMN id SET DEFAULT nextval('public."Order_id_seq"'::regclass);


--
-- Name: OrderItem id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem" ALTER COLUMN id SET DEFAULT nextval('public."OrderItem_id_seq"'::regclass);


--
-- Name: ReportSendingTime id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReportSendingTime" ALTER COLUMN id SET DEFAULT nextval('public."ReportSendingTime_id_seq"'::regclass);


--
-- Name: Statement id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Statement" ALTER COLUMN id SET DEFAULT nextval('public."Statement_id_seq"'::regclass);


--
-- Name: Table id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Table" ALTER COLUMN id SET DEFAULT nextval('public."Table_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Data for Name: MenuItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MenuItem" (id, name, "itemNumber", "imageUrl", price, "createdAt", "updatedAt") FROM stdin;
2	pizza	2		700	2025-05-16 18:40:46.008	2025-05-16 18:40:46.008
3	biriyani	3		300	2025-05-16 18:41:11.531	2025-05-16 18:41:11.531
1	Buger	1		130	2025-05-16 18:40:25.516	2025-05-16 18:40:25.516
5	nodd;es	4		500	2025-05-18 15:40:47.46	2025-05-18 15:40:47.46
6	burger 2 	101		500	2025-05-19 13:45:05.559	2025-05-19 13:45:05.559
7	Mixed Salad with juice	102		5500	2025-05-20 17:06:31.884	2025-05-20 17:06:31.884
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Order" (id, "tableId", "isParcel", status, discount, total, paid, "createdAt", "updatedAt", "completedAt", "kitchenPrinted", "customerPrinted", "sendStatement") FROM stdin;
58	2	f	COMPLETED	0	900	t	2025-05-21 21:54:38.238	2025-05-22 00:08:27.512	2025-05-22 00:08:27.511	f	t	t
68	1	f	COMPLETED	0	17900	t	2025-05-22 00:15:42.98	2025-05-22 00:15:46.81	2025-05-22 00:15:46.807	f	t	t
69	3	f	COMPLETED	0	1000	t	2025-05-22 00:19:02.04	2025-05-22 00:20:31.019	2025-05-22 00:20:31.016	f	t	t
57	1	f	COMPLETED	0	500	t	2025-05-20 21:52:17.351	2025-05-22 00:02:33.791	2025-05-22 00:02:33.786	f	t	t
67	2	f	COMPLETED	0	1860	t	2025-05-21 23:48:31.824	2025-05-21 23:48:41.873	2025-05-21 23:48:41.872	t	t	t
70	1	f	COMPLETED	0	1000	t	2025-05-28 16:50:53.228	2025-05-28 16:50:57.013	2025-05-28 16:50:57.011	t	t	t
71	2	f	COMPLETED	0	12500	t	2025-05-28 16:51:27.706	2025-05-28 16:51:39.903	2025-05-28 16:51:39.901	t	t	t
72	3	f	COMPLETED	0	6500	t	2025-05-28 16:51:38.082	2025-05-28 16:51:41.431	2025-05-28 16:51:41.43	t	t	t
73	2	f	COMPLETED	0	130	f	2025-05-28 17:23:44.67	2025-05-28 17:23:46.858	\N	f	f	f
74	3	f	COMPLETED	0	130	f	2025-05-28 17:25:09.874	2025-05-28 17:25:09.874	\N	f	f	f
75	5	f	COMPLETED	0	8200	f	2025-05-28 17:29:17.799	2025-05-28 17:29:20.835	\N	f	f	f
76	4	f	COMPLETED	0	20400	f	2025-05-28 17:42:07.856	2025-05-28 17:42:07.856	\N	f	f	f
60	2	f	COMPLETED	0	1000	f	2025-05-21 21:56:44.651	2025-05-21 21:56:44.651	2025-05-21 22:04:09.087	f	f	t
61	1	f	COMPLETED	0	2500	f	2025-05-21 22:04:09.087	2025-05-21 22:04:09.087	2025-05-21 22:04:09.087	f	f	t
59	1	f	COMPLETED	0	900	f	2025-05-21 21:55:39.294	2025-05-21 21:55:39.294	2025-05-21 22:04:09.087	f	f	t
62	\N	t	COMPLETED	0	900	t	2025-05-21 22:19:27.421	2025-05-21 23:47:57.353	2025-05-21 23:47:57.35	f	t	t
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderItem" (id, "orderId", "menuItemId", quantity, price) FROM stdin;
231	57	6	1	500
232	58	3	3	300
233	59	3	3	300
234	60	6	2	500
235	61	6	5	500
236	62	3	3	300
240	67	1	2	130
241	67	3	2	300
242	67	6	2	500
243	68	2	2	700
244	68	7	3	5500
245	69	5	2	500
247	70	6	2	500
252	71	7	2	5500
253	71	6	3	500
254	72	6	2	500
255	72	7	1	5500
257	73	1	1	130
258	74	1	1	130
262	75	6	4	500
263	75	2	6	700
264	75	5	4	500
265	76	2	2	700
266	76	6	5	500
267	76	7	3	5500
\.


--
-- Data for Name: ReportSendingTime; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ReportSendingTime" (id, "time") FROM stdin;
1	23:47
\.


--
-- Data for Name: Statement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Statement" (id, date, "totalSale", "createdAt") FROM stdin;
\.


--
-- Data for Name: Table; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Table" (id, number, "createdAt", "updatedAt") FROM stdin;
1	1	2025-05-16 18:41:18.653	2025-05-16 18:41:18.653
2	2	2025-05-16 18:41:20.823	2025-05-16 18:41:20.823
3	3	2025-05-16 18:41:23.91	2025-05-16 18:41:23.91
4	1B	2025-05-16 18:44:35.564	2025-05-16 18:44:35.564
5	2B	2025-05-16 18:44:39.72	2025-05-16 18:44:39.72
6	1A	2025-05-18 15:56:17.327	2025-05-18 15:56:17.327
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, phone, password, name, pin, "createdAt", "updatedAt") FROM stdin;
1	10	123456	riad	123	2025-05-16 14:35:20	2025-05-16 14:35:22
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
3c413a96-cc20-4ac3-bef9-4a033e70c042	905b29b2729df2f1e03f3e8caac941d7ea83ea8e9126ff1f38acbe5dbaf9a964	2025-05-16 23:16:34.241361+06	20250511190213_init	\N	\N	2025-05-16 23:16:34.150954+06	1
1cee222a-7072-41e5-8df3-eaaf1d791c0b	972b81cce4ddcaf1550e6af45ec19bc2aae169fe275532f35949e6205b6aa1b5	2025-05-17 11:11:50.664105+06	20250517051149_new	\N	\N	2025-05-17 11:11:50.651623+06	1
47cbcee6-ac5c-4154-87fd-e75ee1250352	95e5d37c0884a5bf9633b27929a4856708f62d5cc93ec47044a11a72327458d0	2025-05-21 22:00:54.841435+06	20250521160053_semding_time	\N	\N	2025-05-21 22:00:54.792996+06	1
\.


--
-- Name: MenuItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."MenuItem_id_seq"', 7, true);


--
-- Name: OrderItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."OrderItem_id_seq"', 267, true);


--
-- Name: Order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Order_id_seq"', 76, true);


--
-- Name: ReportSendingTime_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ReportSendingTime_id_seq"', 1, true);


--
-- Name: Statement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Statement_id_seq"', 1, false);


--
-- Name: Table_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Table_id_seq"', 6, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_id_seq"', 1, false);


--
-- Name: MenuItem MenuItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MenuItem"
    ADD CONSTRAINT "MenuItem_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: ReportSendingTime ReportSendingTime_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReportSendingTime"
    ADD CONSTRAINT "ReportSendingTime_pkey" PRIMARY KEY (id);


--
-- Name: Statement Statement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Statement"
    ADD CONSTRAINT "Statement_pkey" PRIMARY KEY (id);


--
-- Name: Table Table_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Table"
    ADD CONSTRAINT "Table_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: MenuItem_itemNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "MenuItem_itemNumber_key" ON public."MenuItem" USING btree ("itemNumber");


--
-- Name: Table_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Table_number_key" ON public."Table" USING btree (number);


--
-- Name: User_phone_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_phone_key" ON public."User" USING btree (phone);


--
-- Name: OrderItem OrderItem_menuItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES public."MenuItem"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_tableId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES public."Table"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

