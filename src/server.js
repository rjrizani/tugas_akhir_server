const Hapi = require("@hapi/hapi");
const { nanoid } = require("nanoid");

const init = async () => {
  const server = Hapi.server({
    port: 9000,
    host: 'localhost',
  });

  let books = [];

  server.route({
    method: 'POST',
    path: '/books',
    handler: (req, h) => {
      const { name, year, author, summary, publisher, pageCount, readPage, reading } = req.payload;

      if (!name) {
        return h.response({ status: 'fail', message: 'Gagal menambahkan buku. Mohon isi nama buku' }).code(400);
      }

      if (readPage > pageCount) {
        return h.response({ status: 'fail', message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount' }).code(400);
      }

      const id = nanoid();
      const insertedAt = new Date().toISOString();
      const updatedAt = insertedAt;
      const finished = pageCount === readPage;

      const newBook = {
        id,
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
        finished,
        insertedAt,
        updatedAt,
      };

      books.push(newBook);

      return h.response({ status: 'success', message: 'Buku berhasil ditambahkan', data: { bookId: id } }).code(201);
    },
  });

  server.route({
    method: 'GET',
    path: '/books',
    handler: (req, h) => {
      //return h.response({ status: 'success', data: { books } });
      const simplifiedBooks = books.map(({ id, name, publisher }) => ({ id, name, publisher }));
      return h.response({ status: 'success', data: { books: simplifiedBooks } });
    },
  });

  server.route({
    method: 'GET',
    path: '/books/{bookId}',
    handler: (req, h) => {
      const { bookId } = req.params;
      const book = books.find((b) => b.id === bookId);

      if (!book) {
        return h.response({ status: 'fail', message: 'Buku tidak ditemukan' }).code(404);
      }

      return h.response({ status: 'success', data: { book } });
    },
  });

  server.route({
    method: 'PUT',
    path: '/books/{bookId}',
    handler: (req, h) => {
      const { bookId } = req.params;
      const { name, year, author, summary, publisher, pageCount, readPage, reading } = req.payload;
      const bookIndex = books.findIndex((b) => b.id === bookId);

      if (bookIndex === -1) {
        return h.response({ status: 'fail', message: 'Gagal memperbarui buku. Id tidak ditemukan' }).code(404);
      }

      if (!name) {
        return h.response({ status: 'fail', message: 'Gagal memperbarui buku. Mohon isi nama buku' }).code(400);
      }

      if (readPage > pageCount) {
        return h.response({ status: 'fail', message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount' }).code(400);
      }

      const updatedAt = new Date().toISOString();
      const finished = pageCount === readPage;

      books[bookIndex] = { ...books[bookIndex], name, year, author, summary, publisher, pageCount, readPage, reading, updatedAt, finished };

      return h.response({ status: 'success', message: 'Buku berhasil diperbarui' }).code(200);
    },
  });

  server.route({
    method: 'DELETE',
    path: '/books/{bookId}',
    handler: (req, h) => {
      const { bookId } = req.params;
      const initialLength = books.length;
      books = books.filter((b) => b.id !== bookId);

      if (books.length === initialLength) {
        return h.response({ status: 'fail', message: 'Buku gagal dihapus. Id tidak ditemukan' }).code(404);
      }

      return h.response({ status: 'success', message: 'Buku berhasil dihapus' }).code(200);
    },
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();

