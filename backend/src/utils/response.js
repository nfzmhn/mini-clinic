export const success = (res, data, message = 'OK', status = 200) =>
  res.status(status).json({ success: true, message, data })

export const failure = (res, message = 'Error', status = 400, errors = undefined) =>
  res.status(status).json({ success: false, message, ...(errors && { errors }) })
