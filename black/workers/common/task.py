""" Basic class for Task (the isntance of a running scan
against 1 target) """
import json
from black.db import sessions, models


class Task(object):
    """ Base class for the task """

    def __init__(self, task_id, task_type, target, params, project_uuid):
        # ID returned from the queue
        self.task_id = task_id

        # Name of the task (nmap, dnsscan ...)
        self.task_type = task_type

        # Target of the task
        self.target = target

        # Special parameters
        self.params = params

        # Project, on which the task has been launched
        self.project_uuid = project_uuid

        # Point to the object of ORM
        self.create_db_record()

        # Task's status
        self.status = None

        # Tasks progress
        self.progress = None

        # Tasks text
        self.text = None

        # Points the the asyncio.Process object 
        #   (if the task is launched via Popen)
        # Otherwise nothing
        self.proc = None

        # Keep track of the data
        self.stdout = None
        self.stderr = None
        self.exit_code = None     

        self.exchange = None   

    def get_id(self):
        """ Return the id of the current task """
        return self.task_id

    def set_status(self, new_status, progress=0, text=""):
        """ Change the status of the current task """
        self.status = new_status
        self.progress = progress

        session = sessions.get_new_session()
        task_db_object = session.query(models.Task).filter_by(task_id=self.get_id()).first()
        task_db_object.status = new_status
        task_db_object.progress = progress
        task_db_object.text = text
        session.commit()
        sessions.destroy_session(session)

    def append_stdout(self, stdout=""):
        self.stdout.append(stdout)

        session = sessions.get_new_session()
        task_db_object = session.query(models.Task).filter_by(task_id=self.get_id()).first()
        task_db_object.stdout = task_db_object.stdout + stdout
        session.commit()
        sessions.destroy_session(session)        

    def append_stderr(self, stderr=""):
        self.stderr.append(stderr)

        session = sessions.get_new_session()
        task_db_object = session.query(models.Task).filter_by(task_id=self.get_id()).first()
        task_db_object.stderr = task_db_object.stderr + stderr
        session.commit()
        sessions.destroy_session(session)

    def get_status(self):
        """ Return the status of the current task """
        return self.status

    async def start(self):
        """ Launch the task """
        raise NotImplementedError

    def send_notification(self, command):
        """ Sends 'command' notification to the current process """
        raise NotImplementedError

    async def check_if_exited(self):
        """ Check if the process exited. If so,
        save stdout, stderr, exit_code and update the status """
        raise NotImplementedError

    def wait_for_exit(self):
        raise NotImplementedError

    def create_db_record(self):
        """ Creates the record of the task in a special DB table """

        try:
            session = sessions.get_new_session()

            task_new_object = models.Task(
                task_id=self.get_id(),
                task_type=self.task_type,
                target=json.dumps(self.target),
                params=json.dumps(self.params),
                project_uuid=self.project_uuid,
                stdout="",
                stderr="")

            session.add(task_new_object)
            session.commit()
            sessions.destroy_session(session)
        except Exception as e:
            print("TOTAL SHIT", e, str(e), self.get_id(), self.task_type)
