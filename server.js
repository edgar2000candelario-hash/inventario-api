const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

// Conexión a la base de datos
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'inventario_db',
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'API de inventario funcionando' });
});

// Listar todos los productos
app.get('/productos', async (req, res) => {
  try {
    const [filas] = await pool.query('SELECT * FROM productos');
    res.json(filas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al consultar los productos' });
  }
});

//-------------------


// Crear un producto
app.post('/productos', async (req, res) => {
  const { nombre, precio, stock, categoria_id } = req.body;

  if (!nombre || precio === undefined || !categoria_id) {
    return res.status(400).json({
      error: 'Faltan datos: nombre, precio y categoria_id son obligatorios',
    });
  }

  try {
    const [resultado] = await pool.query(
      'INSERT INTO productos (nombre, precio, stock, categoria_id) VALUES (?, ?, ?, ?)',
      [nombre, precio, stock || 0, categoria_id]
    );
    res.status(201).json({
      id: resultado.insertId,
      nombre,
      precio,
      stock: stock || 0,
      categoria_id,
    });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'La categoría indicada no existe' });
    }
    res.status(500).json({ error: 'Error al crear el producto' });
  }
});
//-----

// Actualizar un producto
app.put('/productos/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, stock, categoria_id } = req.body;

  if (!nombre || precio === undefined || stock === undefined || !categoria_id) {
    return res.status(400).json({
      error: 'Faltan datos: nombre, precio, stock y categoria_id son obligatorios',
    });
  }

  try {
    const [resultado] = await pool.query(
      'UPDATE productos SET nombre = ?, precio = ?, stock = ?, categoria_id = ? WHERE id = ?',
      [nombre, precio, stock, categoria_id, id]
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ id: Number(id), nombre, precio, stock, categoria_id });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'La categoría indicada no existe' });
    }
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});

// Eliminar un producto
app.delete('/productos/:id', async (req, res) => {
  try {
    const [resultado] = await pool.query(
      'DELETE FROM productos WHERE id = ?',
      [req.params.id]
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});
//------------
//-------------------------

app.listen(3000, () => {
  console.log('Servidor en http://localhost:3000');
});