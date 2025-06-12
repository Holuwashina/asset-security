from django.apps import AppConfig

class AssetManagementConfig(AppConfig):
    name = 'assets_management'

    def ready(self):
        import assets_management.signals
