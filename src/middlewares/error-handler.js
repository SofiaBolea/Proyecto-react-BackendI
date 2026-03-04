// Middleware centralizado de manejo de errores
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).render('error', {
        title: 'Error',
        message: err.message || 'Error interno del servidor',
        statusCode,
    });
};

export default errorHandler;
