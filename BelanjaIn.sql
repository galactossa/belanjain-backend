--
-- PostgreSQL database dump
--

\restrict lslMIi0uKa5aSjL5iUe0KgkiuKOVqP3E0gHBndDMT8V0E3mrQZn1ZMlYBWMjeN4

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-06-04 19:24:12

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
-- TOC entry 261 (class 1255 OID 25273)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 24967)
-- Name: alamat; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alamat (
    id_alamat integer NOT NULL,
    id_pengguna integer NOT NULL,
    nama_penerima character varying(100) NOT NULL,
    telepon character varying(20) NOT NULL,
    alamat text NOT NULL,
    kota character varying(50) NOT NULL,
    kode_pos character varying(10),
    utama boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.alamat OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 24966)
-- Name: alamat_id_alamat_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.alamat_id_alamat_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.alamat_id_alamat_seq OWNER TO postgres;

--
-- TOC entry 5337 (class 0 OID 0)
-- Dependencies: 221
-- Name: alamat_id_alamat_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.alamat_id_alamat_seq OWNED BY public.alamat.id_alamat;


--
-- TOC entry 250 (class 1259 OID 33600)
-- Name: blogs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blogs (
    id_blog integer NOT NULL,
    judul character varying(200) NOT NULL,
    konten text NOT NULL,
    foto_url text,
    penulis character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.blogs OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 33599)
-- Name: blogs_id_blog_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.blogs_id_blog_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blogs_id_blog_seq OWNER TO postgres;

--
-- TOC entry 5338 (class 0 OID 0)
-- Dependencies: 249
-- Name: blogs_id_blog_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.blogs_id_blog_seq OWNED BY public.blogs.id_blog;


--
-- TOC entry 258 (class 1259 OID 33667)
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_messages (
    id integer NOT NULL,
    sender_id integer NOT NULL,
    receiver_id integer NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.chat_messages OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 33666)
-- Name: chat_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chat_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chat_messages_id_seq OWNER TO postgres;

--
-- TOC entry 5339 (class 0 OID 0)
-- Dependencies: 257
-- Name: chat_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chat_messages_id_seq OWNED BY public.chat_messages.id;


--
-- TOC entry 238 (class 1259 OID 25153)
-- Name: item_pesanan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.item_pesanan (
    id_item_pesanan integer NOT NULL,
    id_pesanan integer NOT NULL,
    id_produk integer NOT NULL,
    jumlah integer NOT NULL,
    harga numeric(10,2) NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.item_pesanan OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 25152)
-- Name: item_pesanan_id_item_pesanan_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.item_pesanan_id_item_pesanan_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.item_pesanan_id_item_pesanan_seq OWNER TO postgres;

--
-- TOC entry 5340 (class 0 OID 0)
-- Dependencies: 237
-- Name: item_pesanan_id_item_pesanan_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.item_pesanan_id_item_pesanan_seq OWNED BY public.item_pesanan.id_item_pesanan;


--
-- TOC entry 226 (class 1259 OID 25012)
-- Name: kategori; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kategori (
    id_kategori integer NOT NULL,
    nama_kategori character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.kategori OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 25011)
-- Name: kategori_id_kategori_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.kategori_id_kategori_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.kategori_id_kategori_seq OWNER TO postgres;

--
-- TOC entry 5341 (class 0 OID 0)
-- Dependencies: 225
-- Name: kategori_id_kategori_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.kategori_id_kategori_seq OWNED BY public.kategori.id_kategori;


--
-- TOC entry 232 (class 1259 OID 25075)
-- Name: keranjang; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.keranjang (
    id_keranjang integer NOT NULL,
    id_pengguna integer NOT NULL,
    id_produk integer NOT NULL,
    jumlah integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.keranjang OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 25074)
-- Name: keranjang_id_keranjang_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.keranjang_id_keranjang_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.keranjang_id_keranjang_seq OWNER TO postgres;

--
-- TOC entry 5342 (class 0 OID 0)
-- Dependencies: 231
-- Name: keranjang_id_keranjang_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.keranjang_id_keranjang_seq OWNED BY public.keranjang.id_keranjang;


--
-- TOC entry 246 (class 1259 OID 25252)
-- Name: laporan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.laporan (
    id_laporan integer NOT NULL,
    id_pelapor integer NOT NULL,
    tipe_target character varying(20) NOT NULL,
    id_target integer NOT NULL,
    alasan text NOT NULL,
    status character varying(20) DEFAULT 'menunggu'::character varying,
    catatan_admin text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.laporan OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 25251)
-- Name: laporan_id_laporan_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.laporan_id_laporan_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.laporan_id_laporan_seq OWNER TO postgres;

--
-- TOC entry 5343 (class 0 OID 0)
-- Dependencies: 245
-- Name: laporan_id_laporan_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.laporan_id_laporan_seq OWNED BY public.laporan.id_laporan;


--
-- TOC entry 254 (class 1259 OID 33630)
-- Name: loyalty_points; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.loyalty_points (
    id_point integer NOT NULL,
    id_pengguna integer NOT NULL,
    poin integer DEFAULT 0 NOT NULL,
    sumber character varying(50),
    id_referensi integer,
    expired_at date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.loyalty_points OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 33629)
-- Name: loyalty_points_id_point_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.loyalty_points_id_point_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.loyalty_points_id_point_seq OWNER TO postgres;

--
-- TOC entry 5344 (class 0 OID 0)
-- Dependencies: 253
-- Name: loyalty_points_id_point_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.loyalty_points_id_point_seq OWNED BY public.loyalty_points.id_point;


--
-- TOC entry 244 (class 1259 OID 25231)
-- Name: notifikasi; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifikasi (
    id_notifikasi integer NOT NULL,
    id_pengguna integer NOT NULL,
    judul character varying(200) NOT NULL,
    pesan text NOT NULL,
    sudah_dibaca boolean DEFAULT false,
    tipe character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    data jsonb
);


ALTER TABLE public.notifikasi OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 25230)
-- Name: notifikasi_id_notifikasi_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifikasi_id_notifikasi_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifikasi_id_notifikasi_seq OWNER TO postgres;

--
-- TOC entry 5345 (class 0 OID 0)
-- Dependencies: 243
-- Name: notifikasi_id_notifikasi_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifikasi_id_notifikasi_seq OWNED BY public.notifikasi.id_notifikasi;


--
-- TOC entry 260 (class 1259 OID 33695)
-- Name: payments_komerce; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments_komerce (
    id integer NOT NULL,
    payment_id character varying(100) NOT NULL,
    order_id character varying(100) NOT NULL,
    payment_type character varying(20) NOT NULL,
    amount numeric(12,2) NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying,
    va_number character varying(50),
    qr_string text,
    payment_url text,
    customer_name character varying(100),
    customer_email character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.payments_komerce OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 33694)
-- Name: payments_komerce_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_komerce_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_komerce_id_seq OWNER TO postgres;

--
-- TOC entry 5346 (class 0 OID 0)
-- Dependencies: 259
-- Name: payments_komerce_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_komerce_id_seq OWNED BY public.payments_komerce.id;


--
-- TOC entry 220 (class 1259 OID 24948)
-- Name: pengguna; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pengguna (
    id_pengguna integer NOT NULL,
    nama character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password text NOT NULL,
    role character varying(20) DEFAULT 'pembeli'::character varying,
    telepon character varying(20),
    url_foto text,
    aktif boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    google_id character varying(100)
);


ALTER TABLE public.pengguna OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 24947)
-- Name: pengguna_id_pengguna_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pengguna_id_pengguna_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pengguna_id_pengguna_seq OWNER TO postgres;

--
-- TOC entry 5347 (class 0 OID 0)
-- Dependencies: 219
-- Name: pengguna_id_pengguna_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pengguna_id_pengguna_seq OWNED BY public.pengguna.id_pengguna;


--
-- TOC entry 236 (class 1259 OID 25120)
-- Name: pesanan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pesanan (
    id_pesanan integer NOT NULL,
    id_pengguna integer NOT NULL,
    id_alamat integer NOT NULL,
    id_voucher integer,
    tanggal_pesanan timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    total_harga numeric(12,2) NOT NULL,
    potongan_diskon numeric(12,2) DEFAULT 0,
    harga_akhir numeric(12,2) NOT NULL,
    status character varying(30) DEFAULT 'menunggu'::character varying,
    nomor_resi character varying(100),
    metode_pembayaran character varying(50),
    status_pembayaran character varying(30) DEFAULT 'belum_bayar'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pesanan OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 25119)
-- Name: pesanan_id_pesanan_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pesanan_id_pesanan_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pesanan_id_pesanan_seq OWNER TO postgres;

--
-- TOC entry 5348 (class 0 OID 0)
-- Dependencies: 235
-- Name: pesanan_id_pesanan_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pesanan_id_pesanan_seq OWNED BY public.pesanan.id_pesanan;


--
-- TOC entry 256 (class 1259 OID 33647)
-- Name: product_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_images (
    id_image integer NOT NULL,
    id_produk integer NOT NULL,
    image_url text NOT NULL,
    is_primary boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.product_images OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 33646)
-- Name: product_images_id_image_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_images_id_image_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_images_id_image_seq OWNER TO postgres;

--
-- TOC entry 5349 (class 0 OID 0)
-- Dependencies: 255
-- Name: product_images_id_image_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_images_id_image_seq OWNED BY public.product_images.id_image;


--
-- TOC entry 228 (class 1259 OID 25023)
-- Name: produk; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.produk (
    id_produk integer NOT NULL,
    id_toko integer NOT NULL,
    id_kategori integer,
    nama_produk character varying(200) NOT NULL,
    deskripsi text,
    harga numeric(10,2) NOT NULL,
    stok integer DEFAULT 0,
    url_gambar text,
    rata_rating numeric(3,2) DEFAULT 0,
    total_terjual integer DEFAULT 0,
    aktif boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.produk OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 25022)
-- Name: produk_id_produk_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.produk_id_produk_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.produk_id_produk_seq OWNER TO postgres;

--
-- TOC entry 5350 (class 0 OID 0)
-- Dependencies: 227
-- Name: produk_id_produk_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.produk_id_produk_seq OWNED BY public.produk.id_produk;


--
-- TOC entry 252 (class 1259 OID 33614)
-- Name: search_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.search_history (
    id_history integer NOT NULL,
    id_pengguna integer NOT NULL,
    keyword character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.search_history OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 33613)
-- Name: search_history_id_history_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.search_history_id_history_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.search_history_id_history_seq OWNER TO postgres;

--
-- TOC entry 5351 (class 0 OID 0)
-- Dependencies: 251
-- Name: search_history_id_history_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.search_history_id_history_seq OWNED BY public.search_history.id_history;


--
-- TOC entry 248 (class 1259 OID 33584)
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    id_setting integer NOT NULL,
    key character varying(100) NOT NULL,
    value text,
    type character varying(20) DEFAULT 'text'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 33583)
-- Name: settings_id_setting_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.settings_id_setting_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.settings_id_setting_seq OWNER TO postgres;

--
-- TOC entry 5352 (class 0 OID 0)
-- Dependencies: 247
-- Name: settings_id_setting_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.settings_id_setting_seq OWNED BY public.settings.id_setting;


--
-- TOC entry 224 (class 1259 OID 24990)
-- Name: toko; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.toko (
    id_toko integer NOT NULL,
    id_pengguna integer NOT NULL,
    nama_toko character varying(100) NOT NULL,
    logo_toko text,
    deskripsi text,
    aktif boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    banner_toko text
);


ALTER TABLE public.toko OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 24989)
-- Name: toko_id_toko_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.toko_id_toko_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.toko_id_toko_seq OWNER TO postgres;

--
-- TOC entry 5353 (class 0 OID 0)
-- Dependencies: 223
-- Name: toko_id_toko_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.toko_id_toko_seq OWNED BY public.toko.id_toko;


--
-- TOC entry 240 (class 1259 OID 25177)
-- Name: transaksi; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transaksi (
    id_transaksi integer NOT NULL,
    id_pesanan integer NOT NULL,
    metode_pembayaran character varying(50) NOT NULL,
    jumlah_dibayar numeric(12,2) NOT NULL,
    status_pembayaran character varying(30) DEFAULT 'menunggu'::character varying,
    waktu_pembayaran timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.transaksi OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 25176)
-- Name: transaksi_id_transaksi_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transaksi_id_transaksi_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transaksi_id_transaksi_seq OWNER TO postgres;

--
-- TOC entry 5354 (class 0 OID 0)
-- Dependencies: 239
-- Name: transaksi_id_transaksi_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transaksi_id_transaksi_seq OWNED BY public.transaksi.id_transaksi;


--
-- TOC entry 242 (class 1259 OID 25198)
-- Name: ulasan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ulasan (
    id_ulasan integer NOT NULL,
    id_pengguna integer NOT NULL,
    id_produk integer NOT NULL,
    id_pesanan integer NOT NULL,
    rating integer,
    komentar text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ulasan_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.ulasan OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 25197)
-- Name: ulasan_id_ulasan_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ulasan_id_ulasan_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ulasan_id_ulasan_seq OWNER TO postgres;

--
-- TOC entry 5355 (class 0 OID 0)
-- Dependencies: 241
-- Name: ulasan_id_ulasan_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ulasan_id_ulasan_seq OWNED BY public.ulasan.id_ulasan;


--
-- TOC entry 234 (class 1259 OID 25101)
-- Name: voucher; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.voucher (
    id_voucher integer NOT NULL,
    kode character varying(50) NOT NULL,
    tipe_diskon character varying(20) DEFAULT 'persen'::character varying,
    nilai_diskon numeric(10,2) NOT NULL,
    minimal_belanja numeric(10,2) DEFAULT 0,
    maksimal_diskon numeric(10,2),
    berlaku_dari date NOT NULL,
    berlaku_sampai date NOT NULL,
    aktif boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.voucher OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 25100)
-- Name: voucher_id_voucher_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.voucher_id_voucher_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.voucher_id_voucher_seq OWNER TO postgres;

--
-- TOC entry 5356 (class 0 OID 0)
-- Dependencies: 233
-- Name: voucher_id_voucher_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.voucher_id_voucher_seq OWNED BY public.voucher.id_voucher;


--
-- TOC entry 230 (class 1259 OID 25052)
-- Name: wishlist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wishlist (
    id_wishlist integer NOT NULL,
    id_pengguna integer NOT NULL,
    id_produk integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.wishlist OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 25051)
-- Name: wishlist_id_wishlist_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wishlist_id_wishlist_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wishlist_id_wishlist_seq OWNER TO postgres;

--
-- TOC entry 5357 (class 0 OID 0)
-- Dependencies: 229
-- Name: wishlist_id_wishlist_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wishlist_id_wishlist_seq OWNED BY public.wishlist.id_wishlist;


--
-- TOC entry 4962 (class 2604 OID 24970)
-- Name: alamat id_alamat; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alamat ALTER COLUMN id_alamat SET DEFAULT nextval('public.alamat_id_alamat_seq'::regclass);


--
-- TOC entry 5020 (class 2604 OID 33603)
-- Name: blogs id_blog; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blogs ALTER COLUMN id_blog SET DEFAULT nextval('public.blogs_id_blog_seq'::regclass);


--
-- TOC entry 5031 (class 2604 OID 33670)
-- Name: chat_messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages ALTER COLUMN id SET DEFAULT nextval('public.chat_messages_id_seq'::regclass);


--
-- TOC entry 4999 (class 2604 OID 25156)
-- Name: item_pesanan id_item_pesanan; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_pesanan ALTER COLUMN id_item_pesanan SET DEFAULT nextval('public.item_pesanan_id_item_pesanan_seq'::regclass);


--
-- TOC entry 4970 (class 2604 OID 25015)
-- Name: kategori id_kategori; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kategori ALTER COLUMN id_kategori SET DEFAULT nextval('public.kategori_id_kategori_seq'::regclass);


--
-- TOC entry 4982 (class 2604 OID 25078)
-- Name: keranjang id_keranjang; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.keranjang ALTER COLUMN id_keranjang SET DEFAULT nextval('public.keranjang_id_keranjang_seq'::regclass);


--
-- TOC entry 5012 (class 2604 OID 25255)
-- Name: laporan id_laporan; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.laporan ALTER COLUMN id_laporan SET DEFAULT nextval('public.laporan_id_laporan_seq'::regclass);


--
-- TOC entry 5025 (class 2604 OID 33633)
-- Name: loyalty_points id_point; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_points ALTER COLUMN id_point SET DEFAULT nextval('public.loyalty_points_id_point_seq'::regclass);


--
-- TOC entry 5008 (class 2604 OID 25234)
-- Name: notifikasi id_notifikasi; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifikasi ALTER COLUMN id_notifikasi SET DEFAULT nextval('public.notifikasi_id_notifikasi_seq'::regclass);


--
-- TOC entry 5034 (class 2604 OID 33698)
-- Name: payments_komerce id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments_komerce ALTER COLUMN id SET DEFAULT nextval('public.payments_komerce_id_seq'::regclass);


--
-- TOC entry 4957 (class 2604 OID 24951)
-- Name: pengguna id_pengguna; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pengguna ALTER COLUMN id_pengguna SET DEFAULT nextval('public.pengguna_id_pengguna_seq'::regclass);


--
-- TOC entry 4992 (class 2604 OID 25123)
-- Name: pesanan id_pesanan; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pesanan ALTER COLUMN id_pesanan SET DEFAULT nextval('public.pesanan_id_pesanan_seq'::regclass);


--
-- TOC entry 5028 (class 2604 OID 33650)
-- Name: product_images id_image; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images ALTER COLUMN id_image SET DEFAULT nextval('public.product_images_id_image_seq'::regclass);


--
-- TOC entry 4973 (class 2604 OID 25026)
-- Name: produk id_produk; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.produk ALTER COLUMN id_produk SET DEFAULT nextval('public.produk_id_produk_seq'::regclass);


--
-- TOC entry 5023 (class 2604 OID 33617)
-- Name: search_history id_history; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.search_history ALTER COLUMN id_history SET DEFAULT nextval('public.search_history_id_history_seq'::regclass);


--
-- TOC entry 5016 (class 2604 OID 33587)
-- Name: settings id_setting; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings ALTER COLUMN id_setting SET DEFAULT nextval('public.settings_id_setting_seq'::regclass);


--
-- TOC entry 4966 (class 2604 OID 24993)
-- Name: toko id_toko; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.toko ALTER COLUMN id_toko SET DEFAULT nextval('public.toko_id_toko_seq'::regclass);


--
-- TOC entry 5001 (class 2604 OID 25180)
-- Name: transaksi id_transaksi; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaksi ALTER COLUMN id_transaksi SET DEFAULT nextval('public.transaksi_id_transaksi_seq'::regclass);


--
-- TOC entry 5005 (class 2604 OID 25201)
-- Name: ulasan id_ulasan; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ulasan ALTER COLUMN id_ulasan SET DEFAULT nextval('public.ulasan_id_ulasan_seq'::regclass);


--
-- TOC entry 4986 (class 2604 OID 25104)
-- Name: voucher id_voucher; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voucher ALTER COLUMN id_voucher SET DEFAULT nextval('public.voucher_id_voucher_seq'::regclass);


--
-- TOC entry 4980 (class 2604 OID 25055)
-- Name: wishlist id_wishlist; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist ALTER COLUMN id_wishlist SET DEFAULT nextval('public.wishlist_id_wishlist_seq'::regclass);


--
-- TOC entry 5293 (class 0 OID 24967)
-- Dependencies: 222
-- Data for Name: alamat; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alamat (id_alamat, id_pengguna, nama_penerima, telepon, alamat, kota, kode_pos, utama, created_at, updated_at) FROM stdin;
1	1	Budi Santoso	08123456789	Jl. Merdeka No. 10	Jakarta	10110	f	2026-04-20 21:24:39.018276	2026-06-03 19:15:57.43586
2	1	Budi Santoso	08123456789	Jl. Merdeka No. 10	Jakarta	10110	f	2026-06-03 18:55:14.134285	2026-06-03 19:15:57.43586
3	1	Budi Santoso	08123456789	Jl. Merdeka No. 10	Jakarta selatan	10110	t	2026-06-03 19:15:57.473008	2026-06-03 19:15:57.473008
\.


--
-- TOC entry 5321 (class 0 OID 33600)
-- Dependencies: 250
-- Data for Name: blogs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blogs (id_blog, judul, konten, foto_url, penulis, created_at, updated_at) FROM stdin;
1	Tips Belanja Online Aman	Berikut adalah tips belanja online agar tetap aman...	\N	Admin BelanjaIn	2026-04-21 10:16:56.192766	2026-04-21 10:16:56.192766
\.


--
-- TOC entry 5329 (class 0 OID 33667)
-- Dependencies: 258
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_messages (id, sender_id, receiver_id, message, is_read, created_at) FROM stdin;
\.


--
-- TOC entry 5309 (class 0 OID 25153)
-- Dependencies: 238
-- Data for Name: item_pesanan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.item_pesanan (id_item_pesanan, id_pesanan, id_produk, jumlah, harga, subtotal, created_at) FROM stdin;
1	1	8	2	17500000.00	35000000.00	2026-04-20 23:31:49.700805
\.


--
-- TOC entry 5297 (class 0 OID 25012)
-- Dependencies: 226
-- Data for Name: kategori; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kategori (id_kategori, nama_kategori, created_at, updated_at) FROM stdin;
1	Elektronik	2026-04-20 23:03:00.02341	2026-04-20 23:03:00.02341
2	Fashion	2026-04-20 23:03:00.02341	2026-04-20 23:03:00.02341
3	Makanan & Minuman	2026-04-20 23:03:00.02341	2026-04-20 23:03:00.02341
4	Kosmetik	2026-04-20 23:03:00.02341	2026-04-20 23:03:00.02341
5	Olahraga	2026-04-20 23:03:00.02341	2026-04-20 23:03:00.02341
6	Buku	2026-04-20 23:03:00.02341	2026-04-20 23:03:00.02341
7	Perlengkapan Rumah	2026-04-20 23:03:00.02341	2026-04-20 23:03:00.02341
\.


--
-- TOC entry 5303 (class 0 OID 25075)
-- Dependencies: 232
-- Data for Name: keranjang; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.keranjang (id_keranjang, id_pengguna, id_produk, jumlah, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5317 (class 0 OID 25252)
-- Dependencies: 246
-- Data for Name: laporan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.laporan (id_laporan, id_pelapor, tipe_target, id_target, alasan, status, catatan_admin, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5325 (class 0 OID 33630)
-- Dependencies: 254
-- Data for Name: loyalty_points; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.loyalty_points (id_point, id_pengguna, poin, sumber, id_referensi, expired_at, created_at) FROM stdin;
\.


--
-- TOC entry 5315 (class 0 OID 25231)
-- Dependencies: 244
-- Data for Name: notifikasi; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifikasi (id_notifikasi, id_pengguna, judul, pesan, sudah_dibaca, tipe, created_at, updated_at, data) FROM stdin;
1	1	Pesanan Dibuat	Pesanan #1 berhasil dibuat. Total: Rp35,000,000	f	pesanan	2026-04-20 23:31:49.700805	2026-04-20 23:31:49.700805	\N
2	1	Update Status Pesanan	Pesanan #1 status: diproses	f	pesanan	2026-04-20 23:34:21.597986	2026-04-20 23:34:21.597986	\N
3	1	Update Status Pesanan	Pesanan #1 status: selesai	f	pesanan	2026-04-20 23:52:12.473493	2026-04-20 23:52:12.473493	\N
4	1	🗑️ Produk dihapus dari wishlist	Produk "MacBook Air M2" telah dihapus dari wishlist karena sudah 42 hari tidak dibeli.	f	wishlist_expired	2026-06-02 11:15:10.163599	2026-06-02 11:15:10.163599	\N
\.


--
-- TOC entry 5331 (class 0 OID 33695)
-- Dependencies: 260
-- Data for Name: payments_komerce; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments_komerce (id, payment_id, order_id, payment_type, amount, status, va_number, qr_string, payment_url, customer_name, customer_email, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5291 (class 0 OID 24948)
-- Dependencies: 220
-- Data for Name: pengguna; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pengguna (id_pengguna, nama, email, password, role, telepon, url_foto, aktif, created_at, updated_at, google_id) FROM stdin;
1	Budi Raharjo	budi@email.com	$2b$10$ruas6zaDlI1rTwYkn172guJa1DwTmVo1U.LzL9J3oDWnyw1Z9dmY6	penjual	089999888777	\N	t	2026-04-20 21:09:01.422113	2026-04-20 21:28:10.853109	\N
2	Super Admin	admin@belanjain.com	$2b$10$5G7voPAjM/ueX0.HGWyMDuWLPD2a2J8gDsPw2pMOn9L7owCKzgT9u	admin	08123456789	\N	t	2026-04-20 23:38:42.849389	2026-04-20 23:47:17.8924	\N
3	Admin Baru	admin2@belanjain.com	$2b$10$J7klPsj7.eAX28NzPjJ/zenwW9BXQsOZTxHCjSNDHBP3i109RnCza	admin	08123456789	\N	t	2026-04-21 10:09:47.362947	2026-04-21 10:09:47.362947	\N
4	Tora Eldoardo Eko Putra	tora@gmail.com	$2b$10$pT.jOvHmY5b7kDsqjNF54.lo88L3P4LqXJzUQQnjTac.9tuzuChJu	pembeli	081213445	\N	t	2026-04-28 22:49:18.706436	2026-04-28 22:49:18.706436	\N
5	Tora Eldoardo Eko Putra	toraeld8@gmail.com	$2b$10$OxdO0kd3Dv98FgMiFCUSEuSfHJWi2macYO8V7N3jMU4ptJxgmBxTS	pembeli	\N	https://lh3.googleusercontent.com/a/ACg8ocLfoM6ZUfM5I-yT64VCWv8hlp-ioPsEk0NlgqJ2goZHQz-c49DKLw=s96-c	t	2026-06-03 13:04:48.874224	2026-06-03 13:04:48.874224	116601886626456934661
6	toraa	tora123@email.com	$2b$10$T4xESDwA.9tVuUgcFoHiBOdza2sQ9nm5WeME/BemeAPz3hZ/EeBAe	pembeli	081234567890	\N	t	2026-06-03 18:46:44.856186	2026-06-03 18:46:44.856186	\N
\.


--
-- TOC entry 5307 (class 0 OID 25120)
-- Dependencies: 236
-- Data for Name: pesanan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pesanan (id_pesanan, id_pengguna, id_alamat, id_voucher, tanggal_pesanan, total_harga, potongan_diskon, harga_akhir, status, nomor_resi, metode_pembayaran, status_pembayaran, created_at, updated_at) FROM stdin;
1	1	1	\N	2026-04-20 23:31:49.700805	35000000.00	0.00	35000000.00	selesai	\N	transfer	menunggu	2026-04-20 23:31:49.700805	2026-04-20 23:52:12.464279
\.


--
-- TOC entry 5327 (class 0 OID 33647)
-- Dependencies: 256
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_images (id_image, id_produk, image_url, is_primary, created_at) FROM stdin;
\.


--
-- TOC entry 5299 (class 0 OID 25023)
-- Dependencies: 228
-- Data for Name: produk; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.produk (id_produk, id_toko, id_kategori, nama_produk, deskripsi, harga, stok, url_gambar, rata_rating, total_terjual, aktif, created_at, updated_at) FROM stdin;
8	1	1	MacBook Air M2	Laptop Apple terbaru	17500000.00	13	\N	5.00	2	f	2026-04-20 23:04:57.989324	2026-04-20 23:52:50.373662
9	1	1	MacBook Air M2	Laptop Apple terbaru	18500000.00	10	\N	0.00	0	t	2026-06-03 18:53:36.897574	2026-06-03 18:53:36.897574
\.


--
-- TOC entry 5323 (class 0 OID 33614)
-- Dependencies: 252
-- Data for Name: search_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.search_history (id_history, id_pengguna, keyword, created_at) FROM stdin;
1	1	laptop	2026-04-21 10:20:09.728321
\.


--
-- TOC entry 5319 (class 0 OID 33584)
-- Dependencies: 248
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (id_setting, key, value, type, created_at, updated_at) FROM stdin;
2	about_us	BelanjaIn adalah platform e-commerce terpercaya di Indonesia.	text	2026-04-21 10:12:19.17953	2026-04-21 10:12:19.17953
3	contact_info	Email: support@belanjain.com | Telp: 021-80641000	text	2026-04-21 10:12:19.17953	2026-04-21 10:12:19.17953
4	office_address	The Manhattan Square Building, Mid Tower, 12th Floor. Jl. T.B. Simatupang kav 1-S, Cilandak Timur, Jakarta Selatan	text	2026-04-21 10:12:19.17953	2026-04-21 10:12:19.17953
5	company_logo		image	2026-04-21 10:12:19.17953	2026-04-21 10:12:19.17953
1	privacy_policy	Kebijakan privasi terbaru BelanjaIn	text	2026-04-21 10:12:19.17953	2026-04-21 10:13:56.93833
\.


--
-- TOC entry 5295 (class 0 OID 24990)
-- Dependencies: 224
-- Data for Name: toko; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.toko (id_toko, id_pengguna, nama_toko, logo_toko, deskripsi, aktif, created_at, updated_at, banner_toko) FROM stdin;
1	1	Toko Budi	\N	\N	t	2026-04-20 21:28:10.911513	2026-04-20 21:28:10.911513	\N
\.


--
-- TOC entry 5311 (class 0 OID 25177)
-- Dependencies: 240
-- Data for Name: transaksi; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transaksi (id_transaksi, id_pesanan, metode_pembayaran, jumlah_dibayar, status_pembayaran, waktu_pembayaran, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5313 (class 0 OID 25198)
-- Dependencies: 242
-- Data for Name: ulasan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ulasan (id_ulasan, id_pengguna, id_produk, id_pesanan, rating, komentar, created_at, updated_at) FROM stdin;
2	1	8	1	5	Produk bagus banget!	2026-04-20 23:52:50.362663	2026-04-20 23:52:50.362663
\.


--
-- TOC entry 5305 (class 0 OID 25101)
-- Dependencies: 234
-- Data for Name: voucher; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.voucher (id_voucher, kode, tipe_diskon, nilai_diskon, minimal_belanja, maksimal_diskon, berlaku_dari, berlaku_sampai, aktif, created_at, updated_at) FROM stdin;
1	RAMADAN10	persen	10.00	100000.00	\N	2026-04-01	2026-04-30	t	2026-04-20 23:49:52.895246	2026-04-20 23:49:52.895246
\.


--
-- TOC entry 5301 (class 0 OID 25052)
-- Dependencies: 230
-- Data for Name: wishlist; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wishlist (id_wishlist, id_pengguna, id_produk, created_at) FROM stdin;
\.


--
-- TOC entry 5358 (class 0 OID 0)
-- Dependencies: 221
-- Name: alamat_id_alamat_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.alamat_id_alamat_seq', 3, true);


--
-- TOC entry 5359 (class 0 OID 0)
-- Dependencies: 249
-- Name: blogs_id_blog_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.blogs_id_blog_seq', 1, true);


--
-- TOC entry 5360 (class 0 OID 0)
-- Dependencies: 257
-- Name: chat_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chat_messages_id_seq', 1, false);


--
-- TOC entry 5361 (class 0 OID 0)
-- Dependencies: 237
-- Name: item_pesanan_id_item_pesanan_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.item_pesanan_id_item_pesanan_seq', 1, true);


--
-- TOC entry 5362 (class 0 OID 0)
-- Dependencies: 225
-- Name: kategori_id_kategori_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.kategori_id_kategori_seq', 7, true);


--
-- TOC entry 5363 (class 0 OID 0)
-- Dependencies: 231
-- Name: keranjang_id_keranjang_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.keranjang_id_keranjang_seq', 2, true);


--
-- TOC entry 5364 (class 0 OID 0)
-- Dependencies: 245
-- Name: laporan_id_laporan_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.laporan_id_laporan_seq', 1, false);


--
-- TOC entry 5365 (class 0 OID 0)
-- Dependencies: 253
-- Name: loyalty_points_id_point_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.loyalty_points_id_point_seq', 1, false);


--
-- TOC entry 5366 (class 0 OID 0)
-- Dependencies: 243
-- Name: notifikasi_id_notifikasi_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifikasi_id_notifikasi_seq', 4, true);


--
-- TOC entry 5367 (class 0 OID 0)
-- Dependencies: 259
-- Name: payments_komerce_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_komerce_id_seq', 1, false);


--
-- TOC entry 5368 (class 0 OID 0)
-- Dependencies: 219
-- Name: pengguna_id_pengguna_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pengguna_id_pengguna_seq', 6, true);


--
-- TOC entry 5369 (class 0 OID 0)
-- Dependencies: 235
-- Name: pesanan_id_pesanan_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pesanan_id_pesanan_seq', 1, true);


--
-- TOC entry 5370 (class 0 OID 0)
-- Dependencies: 255
-- Name: product_images_id_image_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_images_id_image_seq', 1, false);


--
-- TOC entry 5371 (class 0 OID 0)
-- Dependencies: 227
-- Name: produk_id_produk_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.produk_id_produk_seq', 9, true);


--
-- TOC entry 5372 (class 0 OID 0)
-- Dependencies: 251
-- Name: search_history_id_history_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.search_history_id_history_seq', 1, true);


--
-- TOC entry 5373 (class 0 OID 0)
-- Dependencies: 247
-- Name: settings_id_setting_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.settings_id_setting_seq', 5, true);


--
-- TOC entry 5374 (class 0 OID 0)
-- Dependencies: 223
-- Name: toko_id_toko_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.toko_id_toko_seq', 1, true);


--
-- TOC entry 5375 (class 0 OID 0)
-- Dependencies: 239
-- Name: transaksi_id_transaksi_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transaksi_id_transaksi_seq', 1, false);


--
-- TOC entry 5376 (class 0 OID 0)
-- Dependencies: 241
-- Name: ulasan_id_ulasan_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ulasan_id_ulasan_seq', 2, true);


--
-- TOC entry 5377 (class 0 OID 0)
-- Dependencies: 233
-- Name: voucher_id_voucher_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.voucher_id_voucher_seq', 1, true);


--
-- TOC entry 5378 (class 0 OID 0)
-- Dependencies: 229
-- Name: wishlist_id_wishlist_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.wishlist_id_wishlist_seq', 4, true);


--
-- TOC entry 5046 (class 2606 OID 24983)
-- Name: alamat alamat_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alamat
    ADD CONSTRAINT alamat_pkey PRIMARY KEY (id_alamat);


--
-- TOC entry 5088 (class 2606 OID 33612)
-- Name: blogs blogs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_pkey PRIMARY KEY (id_blog);


--
-- TOC entry 5097 (class 2606 OID 33680)
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- TOC entry 5070 (class 2606 OID 25165)
-- Name: item_pesanan item_pesanan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_pesanan
    ADD CONSTRAINT item_pesanan_pkey PRIMARY KEY (id_item_pesanan);


--
-- TOC entry 5052 (class 2606 OID 25021)
-- Name: kategori kategori_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kategori
    ADD CONSTRAINT kategori_pkey PRIMARY KEY (id_kategori);


--
-- TOC entry 5060 (class 2606 OID 25089)
-- Name: keranjang keranjang_id_pengguna_id_produk_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.keranjang
    ADD CONSTRAINT keranjang_id_pengguna_id_produk_key UNIQUE (id_pengguna, id_produk);


--
-- TOC entry 5062 (class 2606 OID 25087)
-- Name: keranjang keranjang_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.keranjang
    ADD CONSTRAINT keranjang_pkey PRIMARY KEY (id_keranjang);


--
-- TOC entry 5082 (class 2606 OID 25267)
-- Name: laporan laporan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.laporan
    ADD CONSTRAINT laporan_pkey PRIMARY KEY (id_laporan);


--
-- TOC entry 5092 (class 2606 OID 33640)
-- Name: loyalty_points loyalty_points_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_points
    ADD CONSTRAINT loyalty_points_pkey PRIMARY KEY (id_point);


--
-- TOC entry 5080 (class 2606 OID 25245)
-- Name: notifikasi notifikasi_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifikasi
    ADD CONSTRAINT notifikasi_pkey PRIMARY KEY (id_notifikasi);


--
-- TOC entry 5104 (class 2606 OID 33712)
-- Name: payments_komerce payments_komerce_payment_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments_komerce
    ADD CONSTRAINT payments_komerce_payment_id_key UNIQUE (payment_id);


--
-- TOC entry 5106 (class 2606 OID 33710)
-- Name: payments_komerce payments_komerce_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments_komerce
    ADD CONSTRAINT payments_komerce_pkey PRIMARY KEY (id);


--
-- TOC entry 5040 (class 2606 OID 24965)
-- Name: pengguna pengguna_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pengguna
    ADD CONSTRAINT pengguna_email_key UNIQUE (email);


--
-- TOC entry 5042 (class 2606 OID 33716)
-- Name: pengguna pengguna_google_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pengguna
    ADD CONSTRAINT pengguna_google_id_key UNIQUE (google_id);


--
-- TOC entry 5044 (class 2606 OID 24963)
-- Name: pengguna pengguna_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pengguna
    ADD CONSTRAINT pengguna_pkey PRIMARY KEY (id_pengguna);


--
-- TOC entry 5068 (class 2606 OID 25136)
-- Name: pesanan pesanan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pesanan
    ADD CONSTRAINT pesanan_pkey PRIMARY KEY (id_pesanan);


--
-- TOC entry 5095 (class 2606 OID 33659)
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id_image);


--
-- TOC entry 5054 (class 2606 OID 25040)
-- Name: produk produk_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.produk
    ADD CONSTRAINT produk_pkey PRIMARY KEY (id_produk);


--
-- TOC entry 5090 (class 2606 OID 33623)
-- Name: search_history search_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.search_history
    ADD CONSTRAINT search_history_pkey PRIMARY KEY (id_history);


--
-- TOC entry 5084 (class 2606 OID 33598)
-- Name: settings settings_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_key_key UNIQUE (key);


--
-- TOC entry 5086 (class 2606 OID 33596)
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id_setting);


--
-- TOC entry 5048 (class 2606 OID 25005)
-- Name: toko toko_id_pengguna_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.toko
    ADD CONSTRAINT toko_id_pengguna_key UNIQUE (id_pengguna);


--
-- TOC entry 5050 (class 2606 OID 25003)
-- Name: toko toko_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.toko
    ADD CONSTRAINT toko_pkey PRIMARY KEY (id_toko);


--
-- TOC entry 5072 (class 2606 OID 25191)
-- Name: transaksi transaksi_id_pesanan_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaksi
    ADD CONSTRAINT transaksi_id_pesanan_key UNIQUE (id_pesanan);


--
-- TOC entry 5074 (class 2606 OID 25189)
-- Name: transaksi transaksi_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaksi
    ADD CONSTRAINT transaksi_pkey PRIMARY KEY (id_transaksi);


--
-- TOC entry 5076 (class 2606 OID 25214)
-- Name: ulasan ulasan_id_pengguna_id_produk_id_pesanan_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ulasan
    ADD CONSTRAINT ulasan_id_pengguna_id_produk_id_pesanan_key UNIQUE (id_pengguna, id_produk, id_pesanan);


--
-- TOC entry 5078 (class 2606 OID 25212)
-- Name: ulasan ulasan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ulasan
    ADD CONSTRAINT ulasan_pkey PRIMARY KEY (id_ulasan);


--
-- TOC entry 5064 (class 2606 OID 25118)
-- Name: voucher voucher_kode_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voucher
    ADD CONSTRAINT voucher_kode_key UNIQUE (kode);


--
-- TOC entry 5066 (class 2606 OID 25116)
-- Name: voucher voucher_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voucher
    ADD CONSTRAINT voucher_pkey PRIMARY KEY (id_voucher);


--
-- TOC entry 5056 (class 2606 OID 25063)
-- Name: wishlist wishlist_id_pengguna_id_produk_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_id_pengguna_id_produk_key UNIQUE (id_pengguna, id_produk);


--
-- TOC entry 5058 (class 2606 OID 25061)
-- Name: wishlist wishlist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_pkey PRIMARY KEY (id_wishlist);


--
-- TOC entry 5098 (class 1259 OID 33693)
-- Name: idx_chat_messages_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chat_messages_created ON public.chat_messages USING btree (created_at);


--
-- TOC entry 5099 (class 1259 OID 33692)
-- Name: idx_chat_messages_receiver; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chat_messages_receiver ON public.chat_messages USING btree (receiver_id);


--
-- TOC entry 5100 (class 1259 OID 33691)
-- Name: idx_chat_messages_sender; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chat_messages_sender ON public.chat_messages USING btree (sender_id);


--
-- TOC entry 5101 (class 1259 OID 33714)
-- Name: idx_payments_komerce_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_komerce_order_id ON public.payments_komerce USING btree (order_id);


--
-- TOC entry 5102 (class 1259 OID 33713)
-- Name: idx_payments_komerce_payment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_komerce_payment_id ON public.payments_komerce USING btree (payment_id);


--
-- TOC entry 5093 (class 1259 OID 33665)
-- Name: idx_product_images_produk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_images_produk ON public.product_images USING btree (id_produk);


--
-- TOC entry 5132 (class 2620 OID 25275)
-- Name: alamat trigger_alamat_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_alamat_updated_at BEFORE UPDATE ON public.alamat FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5134 (class 2620 OID 25277)
-- Name: kategori trigger_kategori_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_kategori_updated_at BEFORE UPDATE ON public.kategori FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5136 (class 2620 OID 25279)
-- Name: keranjang trigger_keranjang_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_keranjang_updated_at BEFORE UPDATE ON public.keranjang FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5142 (class 2620 OID 25285)
-- Name: laporan trigger_laporan_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_laporan_updated_at BEFORE UPDATE ON public.laporan FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5141 (class 2620 OID 25284)
-- Name: notifikasi trigger_notifikasi_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_notifikasi_updated_at BEFORE UPDATE ON public.notifikasi FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5131 (class 2620 OID 25274)
-- Name: pengguna trigger_pengguna_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_pengguna_updated_at BEFORE UPDATE ON public.pengguna FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5138 (class 2620 OID 25281)
-- Name: pesanan trigger_pesanan_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_pesanan_updated_at BEFORE UPDATE ON public.pesanan FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5135 (class 2620 OID 25278)
-- Name: produk trigger_produk_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_produk_updated_at BEFORE UPDATE ON public.produk FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5133 (class 2620 OID 25276)
-- Name: toko trigger_toko_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_toko_updated_at BEFORE UPDATE ON public.toko FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5139 (class 2620 OID 25282)
-- Name: transaksi trigger_transaksi_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_transaksi_updated_at BEFORE UPDATE ON public.transaksi FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5140 (class 2620 OID 25283)
-- Name: ulasan trigger_ulasan_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_ulasan_updated_at BEFORE UPDATE ON public.ulasan FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5137 (class 2620 OID 25280)
-- Name: voucher trigger_voucher_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_voucher_updated_at BEFORE UPDATE ON public.voucher FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5107 (class 2606 OID 24984)
-- Name: alamat alamat_id_pengguna_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alamat
    ADD CONSTRAINT alamat_id_pengguna_fkey FOREIGN KEY (id_pengguna) REFERENCES public.pengguna(id_pengguna) ON DELETE CASCADE;


--
-- TOC entry 5129 (class 2606 OID 33686)
-- Name: chat_messages chat_messages_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.pengguna(id_pengguna) ON DELETE CASCADE;


--
-- TOC entry 5130 (class 2606 OID 33681)
-- Name: chat_messages chat_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.pengguna(id_pengguna) ON DELETE CASCADE;


--
-- TOC entry 5118 (class 2606 OID 25166)
-- Name: item_pesanan item_pesanan_id_pesanan_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_pesanan
    ADD CONSTRAINT item_pesanan_id_pesanan_fkey FOREIGN KEY (id_pesanan) REFERENCES public.pesanan(id_pesanan) ON DELETE CASCADE;


--
-- TOC entry 5119 (class 2606 OID 25171)
-- Name: item_pesanan item_pesanan_id_produk_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_pesanan
    ADD CONSTRAINT item_pesanan_id_produk_fkey FOREIGN KEY (id_produk) REFERENCES public.produk(id_produk);


--
-- TOC entry 5113 (class 2606 OID 25090)
-- Name: keranjang keranjang_id_pengguna_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.keranjang
    ADD CONSTRAINT keranjang_id_pengguna_fkey FOREIGN KEY (id_pengguna) REFERENCES public.pengguna(id_pengguna) ON DELETE CASCADE;


--
-- TOC entry 5114 (class 2606 OID 25095)
-- Name: keranjang keranjang_id_produk_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.keranjang
    ADD CONSTRAINT keranjang_id_produk_fkey FOREIGN KEY (id_produk) REFERENCES public.produk(id_produk) ON DELETE CASCADE;


--
-- TOC entry 5125 (class 2606 OID 25268)
-- Name: laporan laporan_id_pelapor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.laporan
    ADD CONSTRAINT laporan_id_pelapor_fkey FOREIGN KEY (id_pelapor) REFERENCES public.pengguna(id_pengguna) ON DELETE CASCADE;


--
-- TOC entry 5127 (class 2606 OID 33641)
-- Name: loyalty_points loyalty_points_id_pengguna_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_points
    ADD CONSTRAINT loyalty_points_id_pengguna_fkey FOREIGN KEY (id_pengguna) REFERENCES public.pengguna(id_pengguna) ON DELETE CASCADE;


--
-- TOC entry 5124 (class 2606 OID 25246)
-- Name: notifikasi notifikasi_id_pengguna_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifikasi
    ADD CONSTRAINT notifikasi_id_pengguna_fkey FOREIGN KEY (id_pengguna) REFERENCES public.pengguna(id_pengguna) ON DELETE CASCADE;


--
-- TOC entry 5115 (class 2606 OID 25142)
-- Name: pesanan pesanan_id_alamat_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pesanan
    ADD CONSTRAINT pesanan_id_alamat_fkey FOREIGN KEY (id_alamat) REFERENCES public.alamat(id_alamat);


--
-- TOC entry 5116 (class 2606 OID 25137)
-- Name: pesanan pesanan_id_pengguna_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pesanan
    ADD CONSTRAINT pesanan_id_pengguna_fkey FOREIGN KEY (id_pengguna) REFERENCES public.pengguna(id_pengguna) ON DELETE CASCADE;


--
-- TOC entry 5117 (class 2606 OID 25147)
-- Name: pesanan pesanan_id_voucher_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pesanan
    ADD CONSTRAINT pesanan_id_voucher_fkey FOREIGN KEY (id_voucher) REFERENCES public.voucher(id_voucher);


--
-- TOC entry 5128 (class 2606 OID 33660)
-- Name: product_images product_images_id_produk_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_id_produk_fkey FOREIGN KEY (id_produk) REFERENCES public.produk(id_produk) ON DELETE CASCADE;


--
-- TOC entry 5109 (class 2606 OID 25046)
-- Name: produk produk_id_kategori_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.produk
    ADD CONSTRAINT produk_id_kategori_fkey FOREIGN KEY (id_kategori) REFERENCES public.kategori(id_kategori);


--
-- TOC entry 5110 (class 2606 OID 25041)
-- Name: produk produk_id_toko_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.produk
    ADD CONSTRAINT produk_id_toko_fkey FOREIGN KEY (id_toko) REFERENCES public.toko(id_toko) ON DELETE CASCADE;


--
-- TOC entry 5126 (class 2606 OID 33624)
-- Name: search_history search_history_id_pengguna_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.search_history
    ADD CONSTRAINT search_history_id_pengguna_fkey FOREIGN KEY (id_pengguna) REFERENCES public.pengguna(id_pengguna) ON DELETE CASCADE;


--
-- TOC entry 5108 (class 2606 OID 25006)
-- Name: toko toko_id_pengguna_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.toko
    ADD CONSTRAINT toko_id_pengguna_fkey FOREIGN KEY (id_pengguna) REFERENCES public.pengguna(id_pengguna) ON DELETE CASCADE;


--
-- TOC entry 5120 (class 2606 OID 25192)
-- Name: transaksi transaksi_id_pesanan_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaksi
    ADD CONSTRAINT transaksi_id_pesanan_fkey FOREIGN KEY (id_pesanan) REFERENCES public.pesanan(id_pesanan) ON DELETE CASCADE;


--
-- TOC entry 5121 (class 2606 OID 25215)
-- Name: ulasan ulasan_id_pengguna_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ulasan
    ADD CONSTRAINT ulasan_id_pengguna_fkey FOREIGN KEY (id_pengguna) REFERENCES public.pengguna(id_pengguna) ON DELETE CASCADE;


--
-- TOC entry 5122 (class 2606 OID 25225)
-- Name: ulasan ulasan_id_pesanan_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ulasan
    ADD CONSTRAINT ulasan_id_pesanan_fkey FOREIGN KEY (id_pesanan) REFERENCES public.pesanan(id_pesanan);


--
-- TOC entry 5123 (class 2606 OID 25220)
-- Name: ulasan ulasan_id_produk_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ulasan
    ADD CONSTRAINT ulasan_id_produk_fkey FOREIGN KEY (id_produk) REFERENCES public.produk(id_produk) ON DELETE CASCADE;


--
-- TOC entry 5111 (class 2606 OID 25064)
-- Name: wishlist wishlist_id_pengguna_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_id_pengguna_fkey FOREIGN KEY (id_pengguna) REFERENCES public.pengguna(id_pengguna) ON DELETE CASCADE;


--
-- TOC entry 5112 (class 2606 OID 25069)
-- Name: wishlist wishlist_id_produk_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_id_produk_fkey FOREIGN KEY (id_produk) REFERENCES public.produk(id_produk) ON DELETE CASCADE;


-- Completed on 2026-06-04 19:24:13

--
-- PostgreSQL database dump complete
--

\unrestrict lslMIi0uKa5aSjL5iUe0KgkiuKOVqP3E0gHBndDMT8V0E3mrQZn1ZMlYBWMjeN4

