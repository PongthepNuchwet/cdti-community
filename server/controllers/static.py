def new_name(name) :
    return str(uuid.uuid4()) + '.'+ str(name).split('.')[-1]
